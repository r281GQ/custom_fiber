import uuid from 'uuid';

import { createElement } from './../CreateElement';
import { effects, fiberTypes, timeLimits } from './../Misc/Consts';
import { convertValueToArray } from '../Misc/Functions';
import { updateDomProperties } from '../Diffing/updateDomProps';
import createQueue from './../Misc/Queue';
import createSubscription from './../Misc/Subscription';

const { PLACEMENT, UPDATE, DELETION } = effects;
const { CLASS_COMPONENT, HOST_COMPONENT, HOST_ROOT } = fiberTypes;
const { ENOUGH_TIME } = timeLimits;

// this hold all the tasks which can either come from render or setState
const updateQueue = createQueue();

const subscription = createSubscription();

//this is the subtask which needs to be executed next time the main thread some spare time
let nextSubTask = null;
let pendingCommit = null;
let renderInfo = null;

const commitWork = effect => {
  if (effect.effectTag === PLACEMENT) {
    const parentNode = effect.parent.stateNode;
    const domNode = effect.stateNode;

    updateDomProperties(domNode, {}, effect.props);
    parentNode.appendChild(domNode);
  }

  if (effect.effectTag === UPDATE) {
    const domNode = effect.stateNode;

    if (effect.parent !== effect.alternate.parent) {
      const newParent = effect.parent.stateNode;

      newParent.appendChild(domNode);
    }

    updateDomProperties(domNode, effect.alternate.props, effect.props);
  }

  if (effect.effectTag === DELETION) {
    const domNodeToAppend = effect.parent.stateNode;

    domNodeToAppend.removeChild(effect.stateNode);
  }
};

const commitAllWork = rootFiber => {
  rootFiber.effects.forEach(commitWork);

  // console.log(rootFiber.effects);

  // saves the reference of itself in a field, so
  // the alternate tree can be set up later
  rootFiber.stateNode.__rootContainerFiber = rootFiber;

  subscription.invoke(renderInfo);

  nextSubTask = null;
  pendingCommit = null;
  renderInfo = null;
};

const performTask = deadline => {
  workLoop(deadline);

  if (nextSubTask || updateQueue.size() > 0) {
    requestIdleCallback(performTask);
  }
};

const assignFirstSubtask = () => {
  const taskToExecute = updateQueue.pop();

  if (!taskToExecute) {
    // if there is no task in the queue
    // means nothing to do
    return null;
  }

  renderInfo = taskToExecute;

  const { from, dom, newProps } = taskToExecute;

  if (from === HOST_ROOT) {
    const firstTask = {
      tag: HOST_ROOT,
      alternate: dom.__rootContainerFiber,
      stateNode: dom,
      props: newProps
    };

    return firstTask;
  }
};

function reconcileChildrenArray(fiberBeingExecuted, newChildElements) {
  const elements = convertValueToArray(newChildElements);

  let index = 0;
  let previusFiber = null;
  let alternateFiber = fiberBeingExecuted.alternate
    ? fiberBeingExecuted.alternate.child
    : null;
  const numberOfElements = elements.length;

  while (index < numberOfElements || alternateFiber) {
    const element = elements[index];

    if (!element && alternateFiber) {
      alternateFiber.effectTag = DELETION;
      fiberBeingExecuted.effects = fiberBeingExecuted.effects || [];
      fiberBeingExecuted.effects.push(alternateFiber);
    }

    let fiberToCreate = null;

    if (element && alternateFiber && alternateFiber.type === element.type) {
      fiberToCreate = {
        tag: HOST_COMPONENT,
        type: element.type,
        parent: fiberBeingExecuted,
        child: null,
        sibling: null,
        alternate: alternateFiber,
        stateNode: alternateFiber.stateNode,
        props: element.props,
        partialState: null,
        effectTag: UPDATE,
        effects: []
      };
    }

    if (element && alternateFiber && alternateFiber.type !== element.type) {
      fiberToCreate = {
        tag: HOST_COMPONENT,
        type: element.type,
        parent: fiberBeingExecuted,
        child: null,
        sibling: null,
        alternate: alternateFiber,
        stateNode:
          element.type === 'TEXT ELEMENT'
            ? document.createTextNode(element.props.nodeValue)
            : document.createElement(element.type),
        props: element.props,
        partialState: null,
        effectTag: PLACEMENT,
        effects: []
      };

      alternateFiber.effectTag = DELETION;

      fiberBeingExecuted.effects.push(alternateFiber);
    }

    if (element && !alternateFiber) {
      fiberToCreate = {
        tag: HOST_COMPONENT,
        type: element.type,
        parent: fiberBeingExecuted,
        child: null,
        sibling: null,
        alternate: null,
        stateNode:
          element.type === 'TEXT ELEMENT'
            ? document.createTextNode(element.props.nodeValue)
            : document.createElement(element.type),
        props: element.props,
        partialState: null,
        effectTag: PLACEMENT,
        effects: []
      };
    }

    if (index == 0) {
      fiberBeingExecuted.child = fiberToCreate;
    } else if (previusFiber && element) {
      previusFiber.sibling = fiberToCreate;
    }

    previusFiber = fiberToCreate;

    if (alternateFiber && alternateFiber.sibling) {
      alternateFiber = alternateFiber.sibling;
    } else {
      alternateFiber = null;
    }

    index++;
  }
}

function beginTask(fiberBeingExecuted) {
  const newChildElements = fiberBeingExecuted.props.children;
  reconcileChildrenArray(fiberBeingExecuted, newChildElements);
}

const completeSubTask = fiberBeingExecuted => {
  const { parent, effectTag, effects } = fiberBeingExecuted;

  // propogating the effects up in the tree
  if (parent) {
    const ownEffect = effectTag ? [fiberBeingExecuted] : [];
    const propogatedEffects = effects ? [...effects] : [];
    const mergedEffects = [...propogatedEffects, ...ownEffect];

    parent.effects = parent.effects
      ? parent.effects.concat(mergedEffects)
      : [...mergedEffects];
  } else {
    // means we reached the root, so we have all the effects, we can commit the
    // changes to the dom
    pendingCommit = fiberBeingExecuted;
  }
};

// takes the subtask and start executing it
function executeSubTask(fiberBeingExecuted) {
  // creates possible child fiber with possible siblings
  beginTask(fiberBeingExecuted);

  // if there is a child after the child creation process
  // start working on it
  // so it is a depth first algorithm with iteration
  if (fiberBeingExecuted.child) {
    return fiberBeingExecuted.child;
  }

  let currentFiber = fiberBeingExecuted;

  while (currentFiber) {
    // if there is no more child, only possibility is to go sideways
    // so we can grab the effects from this leaf
    completeSubTask(currentFiber);

    // if there is a sibling start working on the sibling
    if (currentFiber.sibling) {
      return currentFiber.sibling;
    }

    currentFiber = currentFiber.parent;
  }
}

function workLoop(deadline) {
  // checks if there are any subtasks left
  // from the previus task
  // if there is nothing to do
  // assign a new subtask from a task
  if (!nextSubTask) {
    nextSubTask = assignFirstSubtask();
  }

  // deadline.timeRemaining is dynamically being updated at runtime
  // return integers in millisecons how much time your function has before the main thread
  // will be busy again
  // For example return 5 ms means you have 5ms before the main thread has another thing to do
  // technically if you have any value that is greater than 0, you have time to run
  // your function, however just to be sure we can increase this timelimit to make things run
  // smoothly
  while (nextSubTask && deadline.timeRemaining() > ENOUGH_TIME) {
    nextSubTask = executeSubTask(nextSubTask);
  }

  // pendingCommit is null except when completeSubTask was called on the root
  if (pendingCommit) {
    commitAllWork(pendingCommit);
  }
}

export const render = (elements, containerDom) => {
  updateQueue.push({
    id: uuid(),
    from: HOST_ROOT,
    dom: containerDom,
    newProps: { children: elements }
  });

  requestIdleCallback(performTask);
};

function scheduleUpdate(instance, partialState) {
  updateQueue.push({
    from: CLASS_COMPONENT,
    instance: instance,
    partialState: partialState
  });
  requestIdleCallback(performTask);
}

export const subscribeToRenderCommit = fn => subscription.subscribe(fn);
