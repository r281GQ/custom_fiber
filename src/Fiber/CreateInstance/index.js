export default fiber => {
  const { type, props } = fiber;

  const instance = new type(props);

  instance.__fiber = fiber;

  return instance;
};
