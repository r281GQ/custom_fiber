import React from './Fiber';

import { Component } from './Fiber/Component';

import { render, subscribeToRenderCommit } from './Fiber/Engine';

const root = document.getElementById('root');

subscribeToRenderCommit(renderInfo => console.log('Rendering is complete!'));

const AnotherComponent = () => {
  return <div>Nested stuff</div>;
};

class SuperNestedComponent extends Component {
  render() {
    return <div>Super nested stuff</div>;
  }
}

class NewComponent extends Component {
  render = () => {
    return [
      <div>
        New Component
        <SuperNestedComponent />
        <h1 style={{ fontSize: 59 }}>Under nested stuff</h1>
      </div>,
      <button>Array button</button>
    ];
  };
}

class Example extends Component {
  render = () => {
    return (
      <div>
        <AnotherComponent />
        <NewComponent />
        <div>Easy one</div>
      </div>
    );
  };
}

class Main extends Component {
  state = {
    visible: false
  };

  shouldComponentUpdate(nextProps, nextState) {
    return false;
  }

  render() {
    if (!this.state.visible)
      return (
        <div style={{ backgroundColor: 'red' }}>
          <Example />
          <button onClick={() => this.setState({ visible: true })}>
            Switch
          </button>
        </div>
      );

    return (
      <div onClick={() => this.setState({ visible: false })}>Switch back!</div>
    );
  }
}

render(<Main />, root);
