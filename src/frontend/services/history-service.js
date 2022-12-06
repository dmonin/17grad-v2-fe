import eventService from './event-service.js';
export class HistoryService {
  constructor(props) {
    /**
     * @type {Object}
     */
    this.props = props;

    /**
     * @type {Object}
     */
    this.currentState = {};

    window.onpopstate = (e) => {
      this.currentState = e.state;
      eventService.dispatch('history:popstate', e);
    }
  }

  /**
   *
   * @param {Object} state
   * @param {string} title
   * @param {string} url
   */
  pushState(state, title, url) {
    this.currentState = state;
    history.pushState(state, title, url);
  }

  /**
   *
   * @param {Object} state
   * @param {string} title
   * @param {string} url
   */
  updateState(state, title, url) {
    this.currentState = {
      ...this.currentState,
      ...state
    }
    history.replaceState(this.currentState, title, url);
  }
}
const historyService = new HistoryService();
export default historyService;