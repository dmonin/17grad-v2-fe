import Component from "../components/component.js";

export default class BrutalIndexNavigation extends Component {
  constructor() {
    super();

    /**
     * @type {Element}
     * @private
     */
    this.bigTypo = null;
  }
  /** @inheritDoc */
  enterDocument() {
    super.enterDocument();

    const navItems = this.childElements('a');
    for (const navItem of navItems) {
      this.on('mouseenter', this.handleMouseEnter, navItem);
      this.on('mouseleave', this.handleMouseLeave, navItem);
    }
  }

  /**
   *
   * @param {MouseEvent} e
   * @private
   */
  handleMouseEnter(e) {
    this.bigTypo.innerHTML = e.target.innerText;
    this.bigTypo.classList.add('--visible');
  }

  /**
   *
   * @param {MouseEvent} e
   * @private
   */
  handleMouseLeave(e) {
    this.bigTypo.classList.remove('--visible');
  }

  /**
   *
   * @inheritDoc
   */
  setElement(el) {
    super.setElement(el);
    this.bigTypo = document.body.querySelector('.index__big-typo');
  }
}