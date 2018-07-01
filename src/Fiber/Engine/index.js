const { requestIdleCallback } = window;

const ENOUGH_TIME = 1; // milliseconds

let workQueue = [];
let nextUnitOfWork = null;

function schedule(task) {
  workQueue.push(task);
  requestIdleCallback(performWork);
}

function performUnitOfWork(nextUnitOfWork) {
  console.log('Performing work on: ');
  console.log(nextUnitOfWork);
}

const performWork = deadline => {
  if (!nextUnitOfWork) {
    nextUnitOfWork = workQueue.shift();
  }

  while (nextUnitOfWork && deadline.timeRemaining() > ENOUGH_TIME) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }

  if (nextUnitOfWork || workQueue.length > 0) {
    requestIdleCallback(performWork);
  }
};

export default schedule;
