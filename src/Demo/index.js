import createDomNodes from './createDomNodes';

const work = (count, withRequestIdCallback = true) => deadLine => {
  let sampleNumber = 0;

  let i = 0;

  if (withRequestIdCallback) {
    while (i < count && deadLine.timeRemaining() > 1) {
      Math.random() > 0.5 ? sampleNumber++ : sampleNumber--;
      i++;
    }

    if (count > 0) requestIdleCallback(work(count - i));
  } else {
    let sampleNumber = 0;

    let i = 0;

    while (i < count) {
      Math.random() > 0.5 ? sampleNumber++ : sampleNumber--;
      i++;
    }
  }
};

export default () => createDomNodes(work);
