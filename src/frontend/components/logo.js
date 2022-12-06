import Component from './component.js';
import cursor from './cursor.js';
import eventService from '../services/event-service.js';
import navigationService from '../services/navigation-service.js';
import pageStyleService from '../services/page-style-service.js';

/**
 * @export
 * @class Logo
 * @extends {Component}
 */
export default class Logo extends Component {
  constructor(props) {
    super(props);
  }

  /** @inheritDoc */
  enterDocument() {
    super.enterDocument();
    this.on('style-change', this.handleStyleChange, eventService);
    this.setStyle(pageStyleService.style);


    cursor.setHover(this, {cls: 'active'}, {
      element: this.element
    });

    this.on('click', this.handleClick);
  }

  /**
   * @param {MouseEvent} e
   * @private
   */
  handleClick(e) {
    e.preventDefault();
    const currentUrl = new URL(document.location.href);
    const targetUrl = new URL(e.currentTarget.href);
    if (!currentUrl.pathname.match(/^\/(de|es)?$/)) {
      navigationService.navigate(targetUrl.pathname);
    } else {
      eventService.dispatch('request-style-change');
    }
  }

  /**
   * @private
   */
  handleStyleChange(style) {
    this.setStyle(style);
  }

  /**
   * @param {string} style
   */
  setStyle(style) {
    console.log(`Initializing Logo with ${style} style...`);
    const icons = this.element.querySelectorAll('svg');
    if (style == 'progressive') {
      if (icons.length < 2) {
        this.element.appendChild(icons[0].cloneNode(true));
      }
    } else {
      if (icons.length > 1) {
        this.element.removeChild(icons[1]);
      }
    }
  }
}