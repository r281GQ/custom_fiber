import React from './Fiber';

import { Component } from './Fiber/Component';

import { render, subscribeToRenderCommit } from './Fiber/Engine';

const root = document.getElementById('root');

subscribeToRenderCommit(renderInfo => console.log('Rendering is complete!'));

const element = (
  <div style={{ backgroundColor: 'red' }}>
    <div first={true}>hey</div>
    <div second={true}>hi</div>
  </div>
);

class Another extends Component {
  render = () => {
    return <div>nested stuff </div>;
  };
}

class Example extends Component {
  render = () => {
    return <Another />;
    // return <div>Hello</div>;
  };
}

const classElement = (
  <div style={{ backgroundColor: 'red' }}>
    <Example />
  </div>
);

render(classElement, root);

const classElement2 = <div style={{ backgroundColor: 'red' }}>ge</div>;

const otherElement = (
  <div style={{ backgroundColor: 'red' }}>
    <button first={true}>hey</button>
    <button second={true}>hi</button>
    <button>third</button>
  </div>
);

setTimeout(() => {
  render(classElement2, root);
}, 2000);

const otherElement2 = (
  <div style={{ backgroundColor: 'red' }}>
    <div second={true} onClick={e => console.log(e)}>
      hi
    </div>
    <div style={{ backgroundColor: 'purple' }}>third</div>
  </div>
);

// setTimeout(() => {
//   render(otherElement2, root);
// }, 4000);
