import Component from "../components/component.js";

export class ProgressiveClientList extends Component {
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
    this.changeFn = this.change.bind(this);

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

    /**
     * @type {string}
     * @private
     */
    this.status = 'start';
  }

  /**
   * @private
   */
  change() {
    if (this.isDisposed) {
      return;
    }

    this.status = 'change';
    const item = this.clientList.shift();
    this.clientList.push(item);

    const left = this.childElement('.core__clients__logo__left');
    const right = this.childElement('.core__clients__logo__right');

    const newLeft = left.cloneNode(true);
    const newRight = right.cloneNode(true);
    const useEl = newLeft.querySelector('use');
    const href = useEl.getAttribute('xlink:href');
    const newHref = href.replace(/\#.+/, '#' + item);
    useEl.setAttribute('xlink:href', newHref);
    newRight.querySelector('use').setAttribute('xlink:href', newHref);

    newLeft.className = 'core__clients__logo__left';
    newRight.className = 'core__clients__logo__right';
    this.element.appendChild(newLeft);
    this.element.appendChild(newRight);

    setTimeout(() => {
      if (this.isDisposed) {
        return;
      }

      this.status = 'addClass';
      newLeft.classList.add('--in');
      newRight.classList.add('--in');
      left.classList.add('--out');
      right.classList.add('--out');
    }, 50);

    setTimeout(() => {
      this.status = 'start';
      if (this.isDisposed) {
        return;
      }

      this.element.removeChild(left);
      this.element.removeChild(right);

    }, 1500);

    if (this.isInView) {
      this.delay(this.changeFn, 3000);
    }
  }

  /**
   * @return {Element}
   */
  getInViewElement() {
    return this.element;
  }

  /**
   *
   * @param {Element} el
   */
  setElement(el) {
    super.setElement(el);
    this.clientList = el.dataset.clients
                        .split(',');
    const first = this.clientList.shift();
    this.clientList.push(first);
  }

  /** @inheritDoc */
  setInView(isInView) {
    this.isInView = isInView;
    if (this.isInView && this.status == 'start') {
      this.delay(this.changeFn, this.interval);
    }
  }
}