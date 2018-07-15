import React from './Fiber';

import { render, subscribeToRenderCommit } from './Fiber/Engine';

const root = document.getElementById('root');

subscribeToRenderCommit(renderInfo => console.log('Rendering is complete!'));

const element = (
  <div style={{ backgroundColor: 'red' }}>
    <div first={true}>hey</div>
    <div second={true}>hi</div>
  </div>
);

render(element, root);

const otherElement = (
  <div style={{ backgroundColor: 'red' }}>
    <button first={true}>hey</button>
    <button second={true}>hi</button>
    <button>third</button>
  </div>
);

setTimeout(() => {
  render(otherElement, root);
}, 2000);

const otherElement2 = (
  <div style={{ backgroundColor: 'red' }}>
    <div second={true}>hi</div>
    <div>third</div>
  </div>
);

setTimeout(() => {
  render(otherElement2, root);
}, 4000);
