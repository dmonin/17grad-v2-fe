import Component from './component.js';

/**
 * @export
 * @class ProgressSlider
 * @extends {Component}
 */
export default class ProgressSlider extends Component {
  /** @inheritDoc */
  constructor(props) {
    super(props);

    /**
     * @type {Element}
     * @private
     */
    this.track = null;

    /**
     * @type {Element}
     * @private
     */
    this.indexEl = null;

    /**
     * @type {number}
     * @readonly
     */
    this.currentIndex = 0;

    /**
     * @type {number}
     * @readonly
     */
    this.count = 0;
  }

  /** @inheritDoc */
  decorate(el) {
    super.decorate(el);
    this.track = this.childElement('.track');
    this.indexEl = this.childElement('.value');
  }

  /** @inheritDoc */
  enterDocument() {
    super.enterDocument();

    this.on('click', this.handleNext, 'button');
  }

  /**
   * @private
   */
  handleNext() {
    if (this.props.onNext) {
      this.props.onNext();
    }
  }

  /**
   *
   * @param {number} index
   */
  setItemIndex(index) {
    this.currentIndex = index;
    this.indexEl.innerHTML = index;
    if (this.currentIndex == this.count) {
      this.element.classList.add('--last-active');
    } else {
      this.element.classList.remove('--last-active');
    }
  }

  /**
   * @param {number} count
   */
  setItemCount(count) {
    this.count = count;
    this.childElement('.value-of').innerHTML = ' / ' + count;
  }

  /**
   * Sets whether progress slider should be visible
   * @param {boolean} isVisible
   */
  setVisible(isVisible) {
    if (isVisible) {
      this.element.classList.add('--visible');
    } else {
      this.element.classList.remove('--visible');
    }
  }

  /**
   *
   * @param {number} progress
   */
  setValue(progress) {
    const percent = Math.round(progress * 10000/100);
    this.element.style.setProperty('--percent', percent);
    // this.track.style.width = Number() + '%';
  }
}