import stylesheetService from './stylesheet-service.js';
import eventService from './event-service.js';
class PageStyleService {
  constructor() {
    /**
     * @type string;
     */
    this.style = '';
  }

  /**
   * Returns full url to the page, include style get params
   * @param {string=} path
   * @return {URL}
   */
  getUrl(path) {
    let url = new URL(document.location.href);
    if (path) {
      url.pathname = path;
    }
    url.searchParams.set('s', this.style.substr(0, 1));
    return url;
  }

  /**
   */
  initialize() {
    this.style = document.documentElement.querySelector('meta[name=style]').getAttribute('content') || 'corporate';
    console.log(`Style ${this.style}`);
  }

  /**
   * @param {string} style
   */
  setStyle(style) {
    if (style == this.style) {
      return;
    }

    stylesheetService.enable(this.style, false);
    this.style = style;
    stylesheetService.enable(this.style, true);

    eventService.dispatch('style-change', style);

    gtag('event', 'style-switch', {
      'event_category': 'style',
      'event_label': style
    });

  }
}

const pageStyleService = new PageStyleService();
pageStyleService.initialize();
export default pageStyleService;