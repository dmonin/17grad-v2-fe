import Component from "../components/component.js";

export default class EndlessLoader extends Component {
  constructor() {
    super();

    /**
     * @type {string[]}
     * @private
     */
    this.texts = [];

    /**
     * @type {boolean}
     * @private
     */
    this.isInView = false;

    /**
     * @type {Function}
     * @private
     */
    this.setNextStatusFn = this.setNextStatus.bind(this);

    /**
     * @type {number}
     * @private
     */
    this.currentIndex = 0;

    /**
     * @type {string}
     * @private
     */
    this.currentText = '';

    /**
     * @type {number}
     * @private
     */
     this.currentTextIndex = 0;
  }

  /**
   * @inheritDoc
   */
  setElement(el) {
    super.setElement(el);
    this.texts = el.dataset.texts.split('|');
  }

  /**
   *
   */
  setNextStatus() {
    this.currentIndex = this.currentIndex++;
    this.delay(this.setNextStatusFn, 2000, 'next-status');
  }

  /**
   *
   * @param {boolean} isInView
   */
  setInView(isInView) {
    this.isInView = isInView;

    this.setNextStatus();
    if (this.isInView) {

    }
  }
}