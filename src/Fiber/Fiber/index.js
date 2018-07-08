let fiber = {
  // host component is a dom element
  // where the type is a string
  // it can be CLASS_COMPONENT as well
  // this case the type is the type of the class
  tag: HOST_COMPONENT,
  type: 'div',
  parent: parentFiber,
  child: childFiber,
  sibling: null,
  // reference to the currently visible fiber in the dom
  alternate: currentFiber,
  // this is a reference directly to the element
  // can be a dom element or an instantiated class
  stateNode: document.createElement('div'),
  props: { children: [], className: 'foo' },
  partialState: null,
  effectTag: PLACEMENT,
  effects: []
};
