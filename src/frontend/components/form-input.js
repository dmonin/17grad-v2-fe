import Component from './component.js';

/**
 * @export
 * @class FormInput
 * @extends {Component}
 */
export default class FormInput extends Component {
  /** @inheritDoc */
  enterDocument() {
    super.enterDocument();

    this.on('focus', this.handleFocus, this.childElement('input'));
    this.on('blur', this.handleBlur, this.childElement('input'));
  }

  /**
   * @param {FocusEvent} e
   */
  handleFocus(e) {
    e.target.closest('.form-item').classList.add('--focused');
  }

  /**
   * @param {FocusEvent} e
   */
  handleBlur(e) {
    e.target.closest('.form-item').classList.remove('--focused');
  }
}