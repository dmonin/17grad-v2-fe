import Component from "../components/component.js";

export default class BrutalOnePeople extends Component {
  constructor(props) {
    super(props);

    /**
     * @type {HTMLVideoElement}
     * @private
     */
    this.video = null;
  }

  /**
   * @inheritDoc
   */
  enterDocument() {
    super.enterDocument();

    this.on('mouseenter', this.handleMouseEnter);
    this.on('mouseleave', this.handleMouseLeave);
  }

  /**
   * @param {MouseEvent} e
   * @private
   */
  handleMouseEnter(e) {
    this.video.play();


  }

  /**
   * @param {MouseEvent} e
   * @private
   */
  handleMouseLeave(e) {
    this.video.pause();


  }

  setElement(element) {
    super.setElement(element);
    this.video = this.childElement('video');
  }


}