import Component from "./component.js";
import eventService from '../services/event-service.js';

export default class InternalLink extends Component {
  enterDocument() {
    super.enterDocument();

    this.on('click', (e) => {
      e.preventDefault();

      const url = this.element.href ?
        (new URL(this.element.href)).pathname :
         this.element.dataset.url;
      eventService.dispatch('internal-link:navigate', url);
    });
  }
}