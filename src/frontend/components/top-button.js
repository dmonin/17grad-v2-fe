import Component from "./component.js";

import animation from '../animation/animation.js';
import easing from '../animation/easing.js';
import pageStyleService from "../services/page-style-service.js";
import eventService from "../services/event-service.js";
import { splitText } from "../utility/split-text.js";

export default class TopButton extends Component {
  constructor(props) {
    super(props);

    /**
     * @type {number}
     * @private
     */
    this.angle = 0;

    /**
     * @type {string}
     * @private
     */
    this.action = 'back';
  }
  /**
   * @inheritDoc
   */
  enterDocument() {
    super.enterDocument();

    /**
     * @type {Function}
     * @private
     */
    this.frameFn = this.frame.bind(this);

    /**
     * @type {boolean}
     * @private
     */
    this.isAnimating = false;

    /**
     * @type {number}
     * @private
     */
    this.speed = 0.5;

    this.animation = animation([], [], 5000, easing.easeOut, {
      onFrame: this.handleSpeedChange.bind(this)
    });

    this.on('mouseenter', this.handleMouseEnter);
    this.on('mouseleave', this.handleMouseLeave);

    this.on('click', this.handleClick);
  }

  /**
   * @param {MouseEvent} e
   * @private
   */
  handleClick(e) {
    if (this.action == 'back') {
      history.back();
    } else {
      eventService.dispatch('internal-link:navigate', this.action);
    }
  }

  /**
   * //TODO
   * @private
   */
  // backState() {
  //   if (historyService.backStates.length) {
  //     history.back();
  //   } else {
  //     navigationService.navigate('/work');
  //   }
  // }


  /**
   * @param {MouseEvent} e
   * @private
   */
  handleMouseEnter(e) {
    if (pageStyleService.style != 'brutal') {
      return;
    }
    this.speed += 0.01;
    this.animation.stop();
    this.animation.from = [this.speed];
    this.animation.to = [4.5];
    this.animation.ms = 3000;
    this.animation.easing = easing.easeIn;
    this.animation.start();

    if (!this.isAnimating) {
      this.isAnimating = true;
      this.frame();
    }

  }

  /**
   * @param {MouseEvent} e
   * @private
   */
  handleMouseLeave(e) {
    if (pageStyleService.style != 'brutal') {
      return;
    }

    this.animation.stop();
    this.animation.from = [this.speed];
    this.animation.to = [0];
    this.animation.ms = 10000;
    this.animation.easing = easing.easeOut;
    this.animation.start();

  }

  /**
   * @param {Array<number>} value
   * @private
   */
  handleSpeedChange(value) {
    this.speed = value[0];
  }

  /**
   * @private
   */
  frame() {
    if (this.isDisposed) {
      return;
    }

    this.angle += this.speed;
    this.element.style.setProperty('--angle', this.angle + 'deg');
    if (this.speed > 0) {
      requestAnimationFrame(this.frameFn);
    } else {
      this.isAnimating = false;
    }
  }

  /** @inheritDoc */
  setElement(el) {
    super.setElement(el);

    this.action = el.dataset.action || 'back';

    if (pageStyleService.style != 'brutal') {
      return;
    }

    const textNode = this.childElement('span');
    let text = textNode.innerHTML;
    if (text.length < 15) {
      text += ' · ' + text + ' · ';
    }

    textNode.innerHTML = splitText(text);
    for (let i = 0; i < textNode.children.length; i++) {
      textNode.children[i].style.setProperty('--char-index', i);
    }
    textNode.style.setProperty('--char-total', textNode.children.length);
  }
}