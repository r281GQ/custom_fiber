import { Component } from '../Component';

export default fiber => {
  const { type, props } = fiber;

  if (Object.getPrototypeOf(type) !== Component) {
    const instance = new Component(props);

    instance.render = function() {
      return type(this.props);
    };

    instance.render = instance.render.bind(instance);
    instance.__fiber = fiber;
    return instance;
  }

  const instance = new type(props);

  instance.__fiber = fiber;

  return instance;
};
