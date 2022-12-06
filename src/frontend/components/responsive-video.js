import Component from './component.js';

/**
 * @export
 * @class ResponsiveVideo
 * @extends {Component}
 */
export default class ResponsiveVideo extends Component {
  /** @inheritDoc */
  constructor(props) {
    super(props);

    /**
     * @type {number}
     * @private
     */
    this.width = 0;

    /**
     * @type {Array<number>}
     * @private
     */
    this.sizes = [];

    /**
     * @type {Function}
     * @private
     */
    this.updateSizeFn = this.updateSize.bind(this);

    /**
     * @type {Function}
     * @private
     */
    this.updateSourceFn = this.updateSrc.bind(this);
  }

  /** @inheritDoc */
  setElement(el) {
    super.setElement(el);
    this.sizes = el.dataset.sizes.split(',').map((size) => parseInt(size, 10));
    this.sizes.sort((a, b) => a < b ? -1 : 1);
    this.delay(this.updateSizeFn, 100);

    if (this.element.dataset.lazyload == 'false') {
      this.element.src = this.element.dataset.src;
    }
  }

  /**
   * Updates video source matching video size
   * @private
   */
  updateSrc() {
    const width = this.width;
    let srcSize = 0;
    for (const size of this.sizes) {
      if (size > width) {
        srcSize = size;
        break;
      }
    }
    const replaceFn = (str) => {
      return str.replace(/[0-9]+\.(jpg|mp4)/, `${srcSize}.$1`);
    }
    this.element.dataset.src = replaceFn(this.element.dataset.src);
    if (this.element.src) {
      this.element.src = replaceFn(this.element.src);
    }

    this.element.poster = replaceFn(this.element.poster);
  }

  /**
   * Updates video size
   * @private
   */
  updateSize() {
    this.width = this.element.offsetWidth;
    this.updateSrc();
  }
}