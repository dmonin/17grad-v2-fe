import Component from "../../components/component.js";
import eventService from "../../services/event-service.js";
import easing from "../../animation/easing.js";

export class LoaderItem extends Component {
  constructor() {
    super();

    /**
     * @type {number}
     * @private
     */
    this.from = -1;

    /**
     * @type {number}
     * @private
     */
    this.to = -1;

    /**
     * @type {number}
     * @private
     */
    this.viewportWidth = 0;
  }
  /** @inheritDoc */
  enterDocument() {
    super.enterDocument();
    this.on('section-horizontal-scroll', this.handleScroll, eventService);
    this.from = parseInt(this.element.dataset.from, 10);
    this.to = parseInt(this.element.dataset.to, 10);
    this.viewportWidth = window.innerWidth;
  }

  /**
   * @private
   */
  handleScroll(progress, offset) {
    const width = (this.from + this.to) * this.viewportWidth / 100;
    const percent = easing.inAndOut(offset / width);
    const value = percent * this.to;
    this.element.style.transform = `translate(${value}vw, 0)`;

  }

}