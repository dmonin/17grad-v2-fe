import componentFactory from '../components/component-factory.js';
import Component from '../components/component.js';
import ParallaxContainer from '../components/parallax-container.js';
import LazyVideoManager from '../components/lazy-video-manager.js';
import AppearManager from '../components/appear-manager.js';
import cursor from '../components/cursor.js';
import lerp from '../math/lerp.js';
/**
 * @export
 * @class View
 * @extends {Component}
 */
export default class View extends Component {
  constructor(props) {
    super(props);

    /**
     * @type {Array<Component>}
     * @protected
     */
    this.viewChildren = null;

    /**
     * @type {ParallaxContainer}
     * @private
     */
    this.parallax = new ParallaxContainer({});

    /**
     * @type {Array<{regex: RegExp, component: Function}>}
     * @protected
     */
    this.customComponents = [];

    /**
     * @type {IntersectionObserver}
     */
    this.viewObserver = null;

    /**
     * @type {LazyVideoManager}
     * @private
     */
    this.videoManager = null;

    /**
     * @type {AppearManager}
     * @private
     */
    this.appearManager = null;

    /**
     * @type {Object}
     */
    this.state = {};

    /**
     * @type {boolean}
     */
    this.reloadOnStyleChange = true;

    /**
     * @type {string}
     */
    this.name = '';
  }

  /**
   * @param {Element} el
   * @return {Promise<Component>}
   * @protected
   */
  componentFactory(el) {
    return componentFactory(el, this) || componentFactory(el, this, this.customComponents);
  }

  /**
   * @param {Array<IntersectionObserverEntry>} entries
   * @private
   */
  async handleViewObserver(entries) {
    const children = await this.viewChildren;

    for (const child of children) {
      if (!child.setInView) {
        continue;
      }

      for (const entry of entries) {
        if (entry.target == child.element) {
          child.setInView(entry.isIntersecting);
        }
      }
    }

  }

  /**
   * Initializes children components
   *
   * @protected
   */
  initializeChildren() {
    const promises = [];
    const components = this.childElements('.cmp');
    for (const cmpEl of components) {
      const cmpPromise = this.componentFactory(cmpEl);
      if (cmpPromise) {
        promises.push(cmpPromise);
      }
    }

    return Promise.all(promises);
  }

  /** @inheritDoc */
  dispose() {
    super.dispose();
    this.parallax && this.parallax.dispose();
    this.viewObserver && this.viewObserver.disconnect();
    this.viewObserver = null;

    this.videoManager && this.videoManager.dispose();
    this.appearManager && this.appearManager.dispose();
  }

  /** @inheritDoc */
  enterDocument() {
    super.enterDocument();

    this.viewChildren = this.initializeChildren();

    this.viewChildren.then((children) => {
      this.viewObserver = new IntersectionObserver(
        this.handleViewObserver.bind(this), {
          threshold: 0.01
        });

      for (const child of children) {
        if (child && child.setInView) {
          const element = child.getInViewElement() || child.element;
          if (element instanceof Element) {
            this.viewObserver.observe(element);
          }
        }
      }
    });

    cursor.initializeBasics(this);
  }

  /** @inheritDoc */
  exitDocument() {
    super.exitDocument();
    this.viewObserver.disconnect();
  }

  /**
   * Handles Scroll events and sets parallax container position
   * @private
   */
  handleScroll() {
    this.parallax.setPosition(window.scrollY)
  }

  /**
   * Initializes vertical parallax page scrolling
   *
   * @param {{smoothLevel: number}=} options
   * @protected
   */
  initializeParallax(options = {}) {
    if (options.smoothLevel) {
      this.parallax.smoothLevel = options.smoothLevel;
    }
    this.parallax.setElement(this.element);
    this.parallax.enterDocument();
    this.on('scroll', this.handleScroll, window);
  }

  /**
   * Initializes .appear elements
   * @protected
   */
  initializeAppearManager() {
    const threshold =  Array.from({length: 11}, (_, i) => i / 10);
    this.appearManager = new AppearManager({
      selector: '.appear',
      threshold
    });
    this.appearManager.initialize(this.element);
  }

  /**
   * Initializes Lazy Video Observer
   * @protected
   */
  initializeVideoManager() {
    this.videoManager = new LazyVideoManager({
      selector: '.lazy-video',
    });
    this.videoManager.initialize(this.element);
  }

  /**
   * Transition into the page
   * @param {string} path
   * @return {Promise}
   */
  transitionIn() {
    return Promise.resolve();
  }

  /**
   * Transition out of the page
   *
   * @param {string=} newPath
   * @return {Promise}
   */
  transitionOut(newPath) {
    return Promise.resolve();
  }
}