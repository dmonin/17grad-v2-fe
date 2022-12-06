import Component from './component.js';

export default class TagSelect extends Component {
  constructor() {
    super();

    /**
     * @type {Array<string>}
     * @private
     */
    this.selected = [];
  }


  /** @inheritDoc */
  enterDocument() {
    super.enterDocument();
    this.on('click', this.handleClick);
    if (this.selected.length == 0) {
      const firstTag = this.element.querySelector('.tag');
      this.toggleTag(firstTag);
    }
  }

  /**
   * @return {Array<string>}
   */
  getValue() {
    return this.selected;
  }

  /**
   * @param {MouseEvent} e
   * @private
   */
  handleClick(e) {
    const tag = e.target.closest('.tag');
    if (!tag) {
      return;
    }

    this.toggleTag(tag);
  }

  /**
   *
   * @param {Element} tag
   * @private
   */
  toggleTag(tag) {
    const name = tag.innerText;
    const isActive = tag.classList.toggle('--active');
    if (isActive) {
      this.selected.push(name);
    } else {
      const index = this.selected.indexOf(name);
      if (index != -1) {
        this.selected.splice(index, 1);
      }
    }
  }
}