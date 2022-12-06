import Component from "../components/component.js";

const replaceInterval = 2000;

export class CorporateClientList extends Component {
  constructor(props) {
    super(props);

    /**
     * @type {boolean}
     * @private
     */
    this.isInView = false;

    /**
     * @type {Array<string>}
     * @private
     */
    this.clientList = [];

    /**
     * @type {Array<string>}
     * @private
     */
    this.current = [];

    /**
     * @type {Function}
     * @private
     */
    this.replaceFn = this.replace.bind(this);
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
  replace() {
    if (this.isDisposed) {
      return;
    }

    const element = this.childElement('.--replace');
    if (element) {
      const newName = this.clientList.shift();

      const name = element.dataset.name;
      const index = this.current.indexOf(name);
      this.clientList.push(this.current.splice(index, 1)[0]);
      this.current.push(newName);

      const useEl = element.querySelector('use');
      const href = useEl.getAttribute('xlink:href');
      useEl.setAttribute('xlink:href',
        href.replace(new RegExp(name, 'g'), newName));
      element.classList.remove('--replace');
      if (this.isInView) {
        setTimeout(this.replaceFn, replaceInterval);
      }
    } else {
      const clients = this.childElements('.client');
      const random = clients[Math.floor(Math.random() * clients.length)];
      random.classList.add('--replace');
      setTimeout(this.replaceFn, 250)
    }
  }

  /**
   * @inheritDoc
   */
  setElement(el) {
    super.setElement(el);
    const clients = this.childElements('.client');
    for (const client of clients) {
      this.current.push(client.dataset.name);
    }
    this.clientList = el.dataset.clients
                        .split(',')
                        .filter(val => !this.current.includes(val));
  }

  /** @inheritDoc */
  setInView(isInView) {
    this.isInView = isInView;
    if (this.isInView) {
      setTimeout(this.replaceFn, replaceInterval);
    }
  }
}