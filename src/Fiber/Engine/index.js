import { createElement } from './../CreateElement';
import { effects, fiberTypes, timeLimits } from './../Misc/Consts';
import { convertValueToArray } from '../Misc/Functions';
import createQueue from './../Misc/Queue';

const { PLACEMENT } = effects;
const { CLASS_COMPONENT, HOST_COMPONENT, HOST_ROOT } = fiberTypes;
const { ENOUGH_TIME } = timeLimits;

// this hold all the tasks which can either come from render or setState
const updateQueue = createQueue();

//this is the subtask which needs to be executed next time the main thread some spare time
let nextSubTask = null;
let pendingCommit = null;

const commitWork = effect => {
  const domNodeToAppend = effect.parent.stateNode;

  domNodeToAppend.appendChild(effect.stateNode);
};

const commitAllWork = rootFiber => {
  rootFiber.effects.forEach(commitWork);

  nextSubTask = null;
  pendingCommit = null;
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
  const numberOfElements = elements.length;

  while (index < numberOfElements) {
    const { type, props } = elements[index];
    let fiberToCreate = {
      tag: HOST_COMPONENT,
      type: type,
      parent: fiberBeingExecuted,
      child: null,
      sibling: null,
      alternate: null,
      stateNode:
        type === 'TEXT ELEMENT'
          ? document.createTextNode(props.nodeValue)
          : document.createElement(type),
      props,
      partialState: null,
      effectTag: PLACEMENT,
      effects: []
    };

    if (index !== 0) {
      previusFiber.sibling = fiberToCreate;
      previusFiber = fiberToCreate;
    } else {
      fiberBeingExecuted.child = fiberToCreate;
      previusFiber = fiberToCreate;
    }

    index++;
  }
}

function beginTask(fiberBeingExecuted) {
  // if (!taskBeingExecuted.stateNode) {
  //   taskBeingExecuted.stateNode = createDomElement(taskBeingExecuted);
  // }

  const newChildElements = fiberBeingExecuted.props.children;
  reconcileChildrenArray(fiberBeingExecuted, newChildElements);
}

const completeSubTask = fiberBeingExecuted => {
  const { parent, effectTag, effects } = fiberBeingExecuted;

  // propogating the effects up in the tree
  if (parent) {
    const ownEffect = effectTag ? [fiberBeingExecuted] : [];
    const propogatedEffects = [...effects];
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

export function render(elements, containerDom) {
  updateQueue.push({
    from: HOST_ROOT,
    dom: containerDom,
    newProps: { children: elements }
  });

  requestIdleCallback(performTask);
}

function scheduleUpdate(instance, partialState) {
  updateQueue.push({
    from: CLASS_COMPONENT,
    instance: instance,
    partialState: partialState
  });
  requestIdleCallback(performTask);
}

export default { createElement, render };
