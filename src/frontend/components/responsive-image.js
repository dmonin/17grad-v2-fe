import Component from './component.js';

/**
 * @export
 * @class ResponsiveImage
 * @extends {Component}
 */
export default class ResponsiveImage extends Component {
  /** @inheritDoc */
  constructor(props) {
    super(props);

    /**
     * @type {number}
     * @private
     */
    this.aspectRatio = 0;

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
     * @type {boolean}
     * @private
     */
    this.isInView = false;

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
    this.sizes = el.dataset.srcset.split(',');
    this.sizes.sort((a, b) => a < b ? -1 : 1);
    this.aspectRatio = parseInt(el.dataset.width, 10) / parseInt(el.dataset.height, 10);
    this.delay(this.updateSizeFn, 100);
  }

  /**
   *
   * @param {boolean} isInView
   */
  setInView(isInView) {
    this.isInView = isInView;
    if (isInView) {
      this.updateSrc();
    }
  }

  /**
   * Updates video source matching video size
   * @private
   */
  updateSrc() {
    if (!this.isInView) {
      return;
    }

    const sizes = this.sizes
      .map(sizeRaw =>
        parseInt(sizeRaw.split(' ')[1], 10))
      .sort((a, b) => a < b ? -1 : 1);

    const width = this.width;
    let sizeIndex = 0;
    for (let i = 0; i < sizes.length; i++) {
      if (sizes[i] > width) {
        sizeIndex = i;
        break;
      }
    }

    const src = this.sizes[sizeIndex].split(' ')[0];
    this.element.style.backgroundImage = `url("${src}")`;
  }

  /**
   * Updates video size
   * @private
   */
  updateSize() {
    this.width = this.element.offsetWidth;
    this.height = this.width / this.aspectRatio;
    this.element.style.height = this.height + 'px';

    this.updateSrc();
  }
}