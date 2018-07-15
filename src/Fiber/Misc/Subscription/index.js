export default () => {
  const listeners = [];

  return {
    subscribe: fn => listeners.push(fn),
    invoke: element => listeners.forEach(fn => fn(element))
  };
};
