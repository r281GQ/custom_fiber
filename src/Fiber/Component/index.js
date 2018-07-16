import { scheduleUpdate } from './../Engine/index';

export class Component {
  constructor(props) {
    this.props = props || {};
    this.state = this.state || {};
    this.shouldComponentUpdate =
      this.shouldComponentUpdate ||
      function() {
        return true;
      };
  }

  setState(partialState) {
    scheduleUpdate(this, partialState);
  }
}
