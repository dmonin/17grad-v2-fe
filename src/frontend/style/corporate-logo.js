import Component from "../components/component.js";

export class CorporateLogo extends Component {
  /** @inheritDoc */
  enterDocument() {
    super.enterDocument();

    this.on('mouseenter', this.handleMouseEnter, this.childElement('.index__logo__angle'));
    this.on('mouseleave', this.handleMouseLeave, this.childElement('.index__logo__angle'));
  }

  /**
   * @private
   */
  handleMouseEnter() {
    this.element.classList.add('--wireframe');
  }

  /**
   * @private
   */
  handleMouseLeave() {
    this.element.classList.remove('--wireframe');
  }
}