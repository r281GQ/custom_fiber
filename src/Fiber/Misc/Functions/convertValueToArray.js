export default value => {
  if (value === null || typeof value === 'undefined') return [];

  return Array.isArray(value) ? value : [value];
};
