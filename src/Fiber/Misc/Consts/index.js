const PLACEMENT = 1;
const DELETION = 2;
const UPDATE = 3;

const ENOUGH_TIME = 1;

const HOST_COMPONENT = 'host';
const CLASS_COMPONENT = 'class';
const HOST_ROOT = 'root';

export const effects = {
  PLACEMENT,
  DELETION,
  UPDATE
};

export const timeLimits = {
  ENOUGH_TIME
};

export const fiberTypes = {
  HOST_COMPONENT,
  HOST_ROOT,
  CLASS_COMPONENT
};
