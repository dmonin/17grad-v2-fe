import Component from './component.js';

/**
 * @export
 * @class Marquee
 * @extends {Component}
 */
export default class Marquee extends Component {
  constructor(props) {
    super(props);

    /**
     * @type {number}
     * @private
     */
    this.speed = -1;

    /**
     * @type {Array<Element>}
     * @private
     */
    this.content = [];

    /**
     * @type {number}
     * @private
     */
    this.contentWidth = 0;

    /**
     * @type {Function}
     * @private
     */
    this.frameFn = this.frame.bind(this);

    /**
     * @type {number}
     * @private
     */
    this.x = 0;

    /**
     * @type {boolean}
     * @private
     */
    this.isInView = false;
  }

  /**
   * @return {Element}
   */
  getInViewElement() {
    return this.element;
  }

  /**
   * @inheritDoc
   */
  enterDocument() {
    super.enterDocument();
    this.frame();
  }

  /**
   * @private
   */
  frame() {
    const {
      contentWidth,
      speed,
      frameFn,
      isInDocument,
      isDisposed,
      isInView,
    } = this;

    this.x += speed;
    if (this.x >= 0) {
      this.x -= contentWidth;
    } else if (this.x <= -contentWidth * 2) {
      this.x += contentWidth;
    }
    for (const m of this.content) {
      m.style.transform = `translate(${this.x}px, 0)`;
    }

    if (!isDisposed && isInDocument && isInView) {
      requestAnimationFrame(frameFn);
    }
  }

  /**
   * @inheritDoc
   */
  setElement(element) {
    super.setElement(element);

    this.speed = element.dataset.speed ?
      parseInt(element.dataset.speed, 10) : -1;
    const content = this.content;
    content.push(element.querySelector('.marquee__content'));

    this.updateWidth();
    while (content.length < 3) {
      content.push(content[0].cloneNode(true));
      element.appendChild(content[content.length - 1]);
    }
    this.x = -this.contentWidth;
  }

  /**
   *
   * @param {boolean} isInView
   */
  setInView(isInView) {
    if (this.isInView == isInView) {
      return;
    }

    this.isInView = isInView;
    if (this.isInView) {
      this.frameFn();
    }
  }

  /**
   * @private
   */
  updateWidth() {
    this.contentWidth = this.content[0].offsetWidth;
  }
}