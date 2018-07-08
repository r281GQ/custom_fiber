export default () => {
  const implementation = [];

  return {
    size: () => implementation.length,
    getValues: () => [...implementation],
    pop: () => implementation.shift(),
    push: element => implementation.push(element)
  };
};
