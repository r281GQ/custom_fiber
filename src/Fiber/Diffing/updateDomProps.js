const TEXT_ELEMENT = 'TEXT ELEMENT';

export function createDomElement(fiber) {
  const isTextElement = fiber.type === TEXT_ELEMENT;
  const dom = isTextElement
    ? document.createTextNode('')
    : document.createElement(fiber.type);
  updateDomProperties(dom, [], fiber.props);
  return dom;
}

export const updateDomProperties = (stateNode, oldProps, newProps) => {
  const oldPropsNames = Object.keys(oldProps);
  const newPropsNames = Object.keys(newProps);

  const isEventListener = prop => prop.startsWith('on');

  const isNotEventListener = prop => !prop.startsWith('on');

  const addEventListener = (stateNode, props) => prop =>
    stateNode.addEventListener(prop.substring(2).toLowerCase(), props[prop]);

  const removeEventListener = (stateNode, props) => prop =>
    stateNode.removeEventListener(prop.substring(2).toLowerCase(), props[prop]);

  oldPropsNames
    .filter(isEventListener)
    .forEach(removeEventListener(stateNode, oldProps));

  newPropsNames
    .filter(isEventListener)
    .forEach(addEventListener(stateNode, newProps));

  const oldStyleName = Object.keys(oldProps.style || {});

  oldStyleName.forEach(style => {
    stateNode.style[style] = '';
  });

  const newStylenames = Object.keys(newProps.style || {});

  newStylenames.forEach(style => {
    stateNode.style[style] = newProps.style[style];
  });

  const notChildrenOrStyle = prop => !/children|style/.test(prop);

  const removeProp = stateNode => propName => {
    stateNode[propName] = null;
  };

  const addProp = (stateNode, newProps) => propName => {
    stateNode[propName] = newProps[propName];
  };

  oldPropsNames
    .filter(isNotEventListener)
    .filter(notChildrenOrStyle)
    .forEach(removeProp(stateNode));

  newPropsNames
    .filter(isNotEventListener)
    .filter(notChildrenOrStyle)
    .forEach(addProp(stateNode, newProps));
};
