import AsyncDelay from '../utility/async-delay.js';
import { AsyncThrottle } from '../utility/async-throttle.js';
import EventHandler from './event-handler.js';

export default class Component {
  /**
   *
   * @param {*} props
   */
  constructor(props = {}) {
    /**
     * @type {Element}
     */
    this.element = null;

    /**
     * @protected
     */
    this.eventHandler = new EventHandler(this);

    /**
     */
    this.props = props;

    /**
     * @type {Array<Component>}
     * @private
     */
    this.children = [];

    /**
     * @type {Map<string, Component>}
     * @private
     */
    this.childrenMap = new Map();

    /**
     * @type {Component}
     */
    this.parent = null;

    /**
     * @type {boolean}
     * @protected
     */
    this.isInDocument = false;

    /**
     * @type {Map<Function, AsyncDelay}
     * @private
     */
    this.delayMap = new Map();

    /**
     * @type {Map<Function, AsyncThrottle}
     * @private
     */
    this.throttleMap = new Map();

    /**
     * @type {boolean}
     * @protected
     */
    this.isDisposed = false;
  }

  /**
   *
   * @param {Component} child
   * @param {string=} name
   */
  addChild(child, name) {
    if (child.parent) {
      throw new Error('Component has already parent component.');
    }

    child.parent = this;
    this.children.push(child);

    if (name) {
      this.childrenMap.set(name, child);
    }
  }

  /**
   *
   * @param {string} key
   */
  cancelDelay(key) {
    const delay = this.delayMap.get(key);
    if (delay) {
      delay.stop();
    }
  }

  cancelThrottle(key) {
    const throttle = this.throttleMap.get(key);
    if (throttle) {
      throttle.stop();
    }
  }

  /**
   *
   * @param {string} name
   */
  child(name) {
    return this.childrenMap.get(name);
  }

  /**
   * @param {string} selector
   * @return {Element}
   * @protected
   */
  childElement(selector) {
    return this.element.querySelector(selector);
  }

  /**
   * @param {string} selector
   * @return {NodeList}
   * @protected
   */
  childElements(selector) {
    return this.element.querySelectorAll(selector);
  }

  /**
   *
   * @param {Element} element
   */
  decorate(element) {
    this.setElement(element);
    this.enterDocument();
  }

  /**
   * @param {Function} callback
   * @param {number} time
   * @param {string} key
   * @return {AsyncDelay}
   */
  delay(callback, time, key) {
    let delay = this.delayMap.get(key);
    if (!delay) {
      delay = new AsyncDelay(callback);
      this.delayMap.set(key, delay);
    }
    delay.callback = callback;
    delay.start(time);
  }

  /**
   * Destroys all component data
   */
  dispose() {
    this.isDisposed = true;

    if (this.isInDocument) {
      this.exitDocument();
    }
    for (const cmp of this.children) {
      cmp.dispose();
    }
    this.children = [];
    this.childrenMap = null;

    this.element = null;
    this.parent = null;
    this.eventHandler && this.eventHandler.dispose();
    this.eventHandler = null;

    this.delayMap.forEach(delay => delay.dispose());
    this.throttleMap.forEach(throttle => throttle.dispose());
  }

  /**
   *
   */
  enterDocument() {
    if (this.isInDocument) {
      throw new Error('Already in document');
    }
    this.isInDocument = true;

    for (const child of this.children) {
      if (!child.isInDocument) {
        child.enterDocument();
      }
    }
  }

  /**
   *
   */
  exitDocument() {
    if (!this.isInDocument) {
      throw new Error('Not in document');
    }

    for (const child of this.children) {
      child.exitDocument();
    }

    this.eventHandler.detachAll();
    this.isInDocument = false;
  }


  /**
   * @return {Element}
   */
  getInViewElement() {
    return this.element;
  }

  /**
   * @param {string} type
   * @param {Function} listener
   * @param {EventTarget|Element|string?} target
   * @param {Object} options
   * @protected
   */
  on(type, listener, target = null, options) {
    if (typeof target == 'string') {
      target = this.childElement(target);
    }

    target = target || this.element;
    this.eventHandler.on(target, type, listener, options);
  }

  /**
   * @param {string} type
   * @param {Function} listener
   * @param {string?} target
   * @protected
   */
  off(type, listener, target = null) {
    if (typeof target == 'string') {
      target = this.childElement(target);
    }

    target = target || this.element;
    this.eventHandler.off(target, type, listener);
  }

  /**
   *
   * @param {Element} element
   * @private
   */
  setElement(element) {
    this.element = element;
  }

  /**
   * @param {string} name
   * @return {AsyncDelay}
   */
  throttle(callback, time, key = 'default') {
    let throttle = this.throttleMap.get(key);
    if (!throttle) {
      throttle = new AsyncThrottle(callback);
      this.throttleMap.set(key, throttle);
    }
    throttle.callback = callback;
    throttle.fire(time);
  }
}