import Component from './component.js';
import Draggable from './draggable.js';
import animation from '../animation/animation.js';
import easing from '../animation/easing.js';

/**
 * @export
 * @class Scrollable
 * @extends {Component}
 */
export default class Scrollable extends Component {
  constructor(props = {}) {
    super(props);

    this.props.dragSpeed = props && props.dragSpeed || 1.5;

    /**
     * @type {Element}
     * @private
     */
    this.contentEl = null;

    /**
     * @type {number}
     * @private
     */
    this.elementWidth = 0;

    /**
     * @type {number}
     * @private
     */
    this.scrollWidth = 0;

    /**
     * @type {Draggable}
     * @private
     */
    this.draggable = null;

    /**
     * @type {number}
     * @private
     */
    this.currentX = 0;

    /**
     * @type {NodeList}
     * @private
     */
    this.items = null;

    /**
     * @type {IntersectionObserver}
     * @private
     */
    this.itemObserver = null;

    /**
     * @type {number}
     * @private
     */
    this.currentIndex = 0;

    /**
     * @type {Function}
     * @private
     */
    this.snapFn = this.snap.bind(this);

    /**
     * @type {Function}
     * @private
     */
    this.snapAnim = animation([], [], 500, easing.inAndOut, {
      onFrame: this.handleSnapFrame.bind(this),
      onEnd: this.handleSnapEnd.bind(this)
    });

    /**
     * @type {number}
     * @private
     */
    this.snapDelay = 1000;

    /**
     * @type {number}
     * @private
     */
    this.snapFractionMove = 0;

    /**
     * @type {Object}
     * @private
     */
    this.visibleItems = {};

    /**
     * @type {string}
     * @private
     */
    this.direction = 'x';

    /**
     * @type {boolean}
     * @private
     */
    this.scrollBoth = false;
  }

  /** @inheritDoc */
  enterDocument() {
    super.enterDocument();
    this.on('mousewheel', this.handleMouseWheel, null, {passive: false});
    this.on('resize', this.handleResize, window);
    this.updateSize();

    // While user loads the page, area is scrollable
    // This will set css for overflow hidden
    this.element.classList.add('--initialized');
    // this.element.style.overflow = 'hidden';
    // this.element.style.overflowX = 'hidden';
    // this.element.style.overflowY = 'visible';


    if (this.items.length > 1) {
      this.initializeItemObserver();
    }
  }

  /** @inheritDoc */
  exitDocument() {
    super.exitDocument();
    this.snapAnim.stop();
    this.itemObserver && this.itemObserver.disconnect();
  }

  /**
   * @return {number}
   */
  getItemCount() {
    return this.items.length - 1;
  }

  /**
   * @private
   */
  handleDragMove(delta) {
    this.moveBy(delta.x * this.props.dragSpeed);
  }

  /**
   * @private
   */
  handleDragStart() {
    this.cancelDelay('snap');
    if (this.snapAnim.isPlaying) {
      this.snapAnim.stop();
    }
  }

  /**
   *
   * @param {Array<IntersectionObserverEntry>} entries
   * @param {IntersectionObserver} observer
   */
  handleIntersection(entries, observer) {
    const visibleItems = this.visibleItems;
    for (const entry of entries) {
      const index = this.items.indexOf(entry.target);

      if (entry.isIntersecting) {
        visibleItems[index] = entry.intersectionRatio;
      } else {
        visibleItems[index] = 0;
      }

      this.updateMostVisibleItem();
    }
  }

  /**
   * @param {WheelEvent} e
   * @private
   */
  handleMouseWheel(e) {
    const direction = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? 'x' : 'y';

    if (!this.scrollBoth && direction != this.direction) {
      return;
    }

    const delta = direction == 'x' ? e.deltaX : e.deltaY;
    if (this.snapAnim.isPlaying) {
      this.snapAnim.stop();
    }

    e.preventDefault();
    this.moveBy(-delta);
  }

  /**
   * @private
   */
  handleResize() {
    this.delay(this.updateSize.bind(this), 300, 'resize');
  }

  /**
   *
   * @param {Array<number} value
   */
  handleSnapFrame(value) {
    if (this.isDisposed) {
      return;
    }

    const offset = value[0] - this.currentX;
    this.snapFractionMove += offset;

    if (Math.abs(this.snapFractionMove) > 1) {
      const move = Math.round(this.snapFractionMove);
      this.moveBy(move);
      this.snapFractionMove -= move;
    }
  }

  /**
   * @private
   */
  handleSnapEnd() {
    this.snapFractionMove = 0;
  }

  /**
   * @private
   */
  initializeItemObserver() {
    const threshold =  Array.from({length: 10}, (_, i) => i / 10);
    threshold.shift();

    this.itemObserver = new IntersectionObserver(this.handleIntersection.bind(this), {
      root: this.element,
      threshold
    });
    for (let i = 0; i < this.items.length; i++) {
      this.itemObserver.observe(this.items[i]);
    }
  }

  /**
   * @param {number} x
   * @private
   */
  moveBy(x) {
    if (this.isDisposed) {
      return;
    }
    this.currentX += x;
    const max = this.elementWidth - this.scrollWidth;

    // max is a minus number
    this.currentX = Math.min(0, Math.max(this.currentX, max));

    // this.element.scrollBy({
    //   left: -x
    // });
    this.contentEl.style.transform = `translateX(${this.currentX}px)`;
    if (this.props.onProgress) {
      const progress = this.currentX / max;
      this.props.onProgress(progress, this.currentX, max, x);
    }

    if (this.props.snap && !this.draggable.isDragging) {
      this.delay(this.snapFn, this.snapDelay, 'snap');
    }
  }

  /** @inheritDoc */
  setElement(element) {
    super.setElement(element);

    this.contentEl = element.querySelector('.scrollable__content');
    this.items =  Array.from(element.querySelectorAll('.scrollable__item'));
    this.props.dragSpeed = Number(element.dataset.dragSpeed) || 1.5;
    this.props.snap = element.dataset.snap == 'true';
    this.snapDelay = Number(element.dataset.snapDelay) || 1000;

    this.direction = element.dataset.direction || 'x';
    this.scrollBoth = element.dataset.scrollboth == 'true';

    this.draggable = new Draggable({
      onStart: this.handleDragStart.bind(this),
      onMove: this.handleDragMove.bind(this)
    });
    this.addChild(this.draggable);
    this.draggable.decorate(element);
  }

  /**
   * @param {number=} itemIndex
   * @param {boolean=} instant
   */
  snap(itemIndex = this.currentIndex, instant = false) {
    const rect = this.items[itemIndex].getBoundingClientRect();
    const center = (window.innerWidth - rect.width) / 2;
    const offset = center - rect.left;
    if (instant) {
      this.moveBy(offset);
      return;
    }

    if (this.currentX + offset > 0) {
      return;
    }
    else if (Math.abs(offset) < 1) {
      return;
    }
    else if (Math.abs(offset) < 30) {
      this.element.scrollBy({
        left: offset,
        behavior: 'smooth'
      });
    } else {
      this.snapAnim.stop();
      this.snapAnim.from = [this.currentX];
      this.snapAnim.to = [this.currentX + offset];
      this.snapAnim.start();
    }
  }

  /**
   * @private
   */
  updateDraggableActiveState() {
    const isDraggable = this.elementWidth < this.scrollWidth;
    this.draggable.setActive(isDraggable);
  }

  /**
   * @private
   */
  updateMostVisibleItem() {
    // this.currentIndex = index;
    let maxVisibleIndex = 0;
    let maxVisibleRatio = 0;
    for (let i = 0; i < this.items.length; i++) {
      if (this.visibleItems[i] > maxVisibleRatio) {
        maxVisibleIndex = i;
        maxVisibleRatio = this.visibleItems[i];
      }
    }
    if (maxVisibleIndex != this.currentIndex) {
      this.currentIndex = maxVisibleIndex;
      if (this.props.onItemChange) {
        this.props.onItemChange(maxVisibleIndex, this.items[maxVisibleIndex]);
      }
    }
  }

  /**
   * @private
   */
  updateSize() {
    this.elementWidth = this.element.offsetWidth;
    this.scrollWidth = this.contentEl.scrollWidth;
    this.updateDraggableActiveState();
  }
}