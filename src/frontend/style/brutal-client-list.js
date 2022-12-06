import Component from "../components/component.js";

export class BrutalClientList extends Component {
  constructor(props) {
    super(props);

    /**
     * @type {number}
     * @private
     */
    this.interval = 1000 / 2;

    /**
     * @type {Function}
     * @private
     */
    this.frameFn = this.frame.bind(this);

    /**
     * @type {Array<string>}
     * @private
     */
    this.clients = [];

    /**
     * @type {boolean}
     * @private
     */
    this.isInView = false;

    /**
     * @type {number}
     * @private
     */
    this.timerId = 0;
  }

  /** @inheritDoc */
  enterDocument() {
    super.enterDocument();

    this.on('mouseenter', () => this.interval = 1000 / 20);
    this.on('mouseleave', () => this.interval = 1000 / 2);
  }

  /**
   * @return {Element}
   */
  getInViewElement() {
    return this.element;
  }

  /**
   * @private
   */
  frame() {
    const item = this.clientList.shift();
    this.clientList.push(item);

    const useEl = this.element.querySelector('use');
    const href = useEl.getAttribute('xlink:href');
    useEl.setAttribute('xlink:href',
      href.replace(/\#.+/, '#' + item));

    if (this.isInView) {
      this.delay(this.frameFn, this.interval);
    }
  }

  /**
   *
   * @param {Element} el
   */
  setElement(el) {
    super.setElement(el);
    this.clientList = el.dataset.clients
                        .split(',');
  }

  /** @inheritDoc */
  setInView(isInView) {
    this.isInView = isInView;
    if (this.isInView) {
      this.delay(this.frameFn, this.interval);
    }
  }
}