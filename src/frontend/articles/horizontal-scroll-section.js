import Component from "../components/component.js";
import cachedRect from "../utility/cached-rect.js";
import clamp from "../math/clamp.js";
import eventService from "../services/event-service.js";

export default class HorizontalScrollSection extends Component {
  constructor() {
    super();

    /**
     * @type {Object}
     * @private
     */
    this.cachedRect = null;

    /**
     * @type {number}
     * @private
     */
     this.winWidth = 0;

    /**
     * @type {number}
     * @private
     */
    this.winHeight = 0;

    /**
     * @type {number}
     * @private
     */
     this.width = 0;

     /**
      * @type {Element}
      * @private
      */
     this.frame = null;

     /**
      * @type {number}
      * @private
      */
     this.lastPosition = 0;
  }
  /** @inheritDoc */
  enterDocument() {
    super.enterDocument();
    this.updateDimensions();
    this.on('scroll', this.handleScroll, window);
    this.cachedRect = cachedRect(this.element);
  }

  /**
   * @private
   */
  handleScroll() {
    const y = window.scrollY;
    const rect = this.cachedRect.rect(window.scrollY);

    const max = rect.height - this.winHeight;
    const position = clamp((rect.top / (max + this.winWidth)) * -1, 0, 1);
    const offset = Math.round(position * this.width);
    this.frame.style.transform = `translateX(-${offset}px)`;
    eventService.dispatch('section-horizontal-scroll', position, offset);
  }

  setElement(element) {
    super.setElement(element);
    this.frame = this.childElement('.article__horizontal__section__frame');
  }

  setInView(isInView) {
    console.log(isInView);
  }

  /**
   * Updates container dimensions
   */
  updateDimensions() {
    this.width = this.childElement('.article__horizontal__section__camera').scrollWidth;
    this.element.style.height = this.width + 'px';

    this.winHeight = window.innerHeight;
    this.winWidth = window.innerWidth;
  }
}