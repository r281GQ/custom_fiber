// import startDemo from './Demo';

// startDemo();

import React from './Fiber';

import { render } from './Fiber/Engine';

const root = document.getElementById('root');

const element = (
  <div style={{ backGroundColor: 'red' }}>
    <div first={true}>hey</div>
    <div second={true}>hi</div>
  </div>
);

render(element, root);
