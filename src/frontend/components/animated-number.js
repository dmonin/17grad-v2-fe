'use strict';

import Component from "./component.js";
import animation from '../animation/animation.js';
import easing from '../animation/easing.js';

export default class AnimatedNumber extends Component {
  constructor(props) {
    super(props);

    /**
     * @type {Object}
     * @private
     */
    this.animation = animation([], [], 300, easing.easeOut, {
      onFrame: this.update.bind(this)
    });

    /**
     * @type {number}
     * @private
     */
    this.currentValue = props.value || 0;
  }

  /** @inheritDoc */
  enterDocument() {
    super.enterDocument();
    this.delay(() => {
      this.update([this.currentValue]);
    }, 50);
  }

  /**
   *
   * @param {number} value
   */
  setValue(value) {
    this.animation.stop();
    this.animation.from = [this.currentValue];
    this.animation.to = [value];
    this.animation.start();
  }

  /**
   * @private
   */
  update(value) {
    this.element.innerHTML = this.props.formatter(value[0]);
    this.currentValue = value[0];
  }
}