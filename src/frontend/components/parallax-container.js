'use strict';

import Component from "./component.js";

/**
 * @export
 * @class ParallaxContainer
 * @extends {Component}
 */
export default class ParallaxContainer extends Component {
  constructor(props) {
    super(props);

    /**
     * @type {Function}
     * @private
     */
    this.frameFn = this.frame.bind(this);

    /**
     * @type {string}
     */
    this.axis = 'y';

    /**
     * @type {number}
     * @private
     */
    this.position = 0;

    /**
     * @type {Array<ParallaxElement>}
     * @private
     */
    this.elements = null;

    /**
     * @type {Array<Element>}
     * @private
     */
    this.visibleElements = [];

    /**
     * Tuple for viewport size
     *
     * @type {Array<number>}
     * @private
     */
    this.viewportSize = [];

    /**
     * @type {IntersectionObserver}
     * @private
     */
    this.observer = null;

    /**
     * @type {IntersectionObserverInit}
     */
    this.observerSettings = {
      threshold: 0.001
    };

    /**
     * @type {number}
     */
    this.smoothLevel = 0;
  }

  /** @inheritDoc */
  enterDocument() {
    super.enterDocument();
    if (!this.elements) {
      const elements = this.childElements('.parallax');
      this.elements = [];
      for (const element of elements) {
        const parallax = new ParallaxElement(element);
        parallax.smoothLevel = this.smoothLevel;
        this.elements.push(parallax);
      }
    }
    this.updateViewportSize();

    this.on('resize', this.updateViewportSize, window);

    this.update();
    this.observer = new IntersectionObserver(this.handleElementVisible.bind(this), this.observerSettings);

    for (const parallax of this.elements) {
      this.observer.observe(parallax.element);
    }
  }

  /** @inheritDoc */
  exitDocument() {
    super.exitDocument();
    this.observer.disconnect();
    this.observer = null;
  }

  /**
   * Animation Frame
   * @private
   */
  frame() {
    if (this.isDisposed || !this.isInDocument) {
      return;
    }

    const active = this.elements.filter(p => p.isActive);
    active.forEach(p => p.frame());
    if (!active.length) {
      return;
    }
  }

  /**
   * @param {Array<IntersectionObserverEntry>} entries
   * @private
   */
  handleElementVisible(entries) {
    // const { visibleElements } = this;
    for (const entry of entries) {
      for (const parallax of this.elements) {
        if (parallax.element == entry.target) {
          parallax.isVisible = entry.isIntersecting;
          break;
        }
      }
    }

    this.update();
  }

  /**
   * Sets scrolling position
   * @param {number} position
   */
  setPosition(position) {
    if (!this.isInDocument) {
      return;
    }

    this.position = position;

    this.update();
  }

  update() {
    if (this.isDisposed || !this.isInDocument) {
      return;
    }

    for (const parallax of this.elements) {
      parallax.update(this.position, this.axis, this.viewportSize);
    }

    requestAnimationFrame(this.frameFn);
  }

  /**
   * Updates current viewport size
   * @private
   */
  updateViewportSize() {
    this.viewportSize = [window.innerWidth, window.innerHeight];
  }
}

class ParallaxElement {
  constructor(element) {
    /**
     * @type {string}
     */
    this.axis = element.dataset.parallaxAxis;

    /**
     * @type {Object}
     */
    this.cachedRect = null;

    /**
     * @type {Element}
     */
    this.element = element;

    /** @type {boolean} */
    this.isActive = true;

    /**
     * @type {boolean}
     */
    this.isVisible = true;

    /**
     * Target Parallax Value (in case of the smooth animation)
     * @type {number}
     */
    this.target = 0;

    /**
     * Current Parallax Value
     * @type {number}
     */
    this.value = 0;

    /**
     * The higher the smooth level, slowlier we get to the target
     * @type {number}
     */
    this.smoothLevel = 0;

    /**
     * @type {boolean}
     * @private
     */
    this.disableCache = element.dataset.parallaxDisableCache == 'true';
  }

  calculateTarget(position, axis, viewportSize) {
    const rect = this.rect(position);

    const isX = axis == 'x';
    const viewport = isX ? viewportSize[0] : viewportSize[1];
    const size = isX ? rect.width : rect.height;
    const max = 1 + size / viewport;

    let start = isX ? rect.left : rect.top;
    if (rect.cached) {
      start += (position - rect.position) * -1;
    }
    if (start > viewport) {
      return max;
    } else if (start + size < 0) {
      return -max;
    } else {
      const value = 0.5 * (2 * start + size - viewport) / (viewport * 0.5);
      return value;
    }
  }

  rect(position) {
    const time = +new Date();
    if (this.cachedRect && time - this.cachedRect.time < 1000 && !this.disableCache) {
      return this.cachedRect;
    } else {
      const rect = this.element.getBoundingClientRect();
      this.cachedRect = {
        cached: true,
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        time: +new Date(),
        position
      };
      return rect;
    }
  }

  /**
   */
  frame() {
    if (this.value == this.target) {
      this.isActive = false;
      return;
    }

    if (this.smoothLevel <= 1) {
      this.value = this.target;
    } else {
      this.value += (this.target - this.value) / this.smoothLevel;
      if (Math.abs(this.value - this.target) < 0.0001) {
        this.value = this.target;
      }
    }
    this.element.style.setProperty('--parallax', this.value);
  }

  /**
   *
   * @param {number} position
   * @param {string} axis
   * @param {Array<number>} viewportSize
   */
  update(position, axis, viewportSize) {
    if (!this.isVisible) {
      this.isActive = false;
      return;
    }
    axis = this.axis || axis;
    this.target = this.calculateTarget(position, axis, viewportSize);
    this.isActive = this.target != this.value;
  }
}