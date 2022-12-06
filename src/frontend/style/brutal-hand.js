import MaskedVideo from "../components/masked-video.js";
import eventService from '../services/event-service.js';
import lerp from "../math/lerp.js";
import sign from "../math/sign.js";
export default class BrutalHand extends MaskedVideo {
  constructor() {
    super();

    /**
     * @type {number}
     * @private
     */
    this.targetHandFrame = 2;

    /**
     * @type {number}
     * @private
     */
    this.handFrameIndex = 0;

    /**
     * @type {number}
     * @private
     */
    this.targetAngle = 0;

    /**
     * @type {number}
     * @private
     */
    this.handAngle = 0;

    /**
     * @type {Function}
     * @private
     */
    this.handFrameFn = this.handFrame.bind(this);

    /**
     * @type {number}
     * @private
     */
    this.isMenuOpen = false;

    /**
     * @type {number}
     * @private
     */
    this.x = 0;
  }

  /** @inheritDoc */
  enterDocument() {
    super.enterDocument();

    this.on('mousemove', this.handleMouseMove, eventService);

    requestAnimationFrame(this.handFrameFn);

    this.on('menu-open', this.handleMenuOpen, eventService);
    this.on('menu-close', this.handleMenuClose, eventService);
  }

  /**
   * @private
   */
  handleMenuOpen() {
    this.isMenuOpen = true;
  }

  /**
   * @private
   */
  handleMenuClose() {
    this.isMenuOpen = false;
  }

  /**
   * @private
   */
  handFrame() {
    if (this.isDisposed || this.isMenuOpen) {
      return;
    }

    if (!this.isInitialized) {
      requestAnimationFrame(this.handFrameFn);
      return;
    }

    let position = this.handFrameIndex;
    let targetPosition = this.targetHandFrame;
    if (position != targetPosition) {
      position += sign(targetPosition - position);
      if (Math.abs(position - targetPosition) < 1) {
        position = Math.floor(targetPosition);
      }

      this.setPosition(this.frames[position]);
      this.handFrameIndex = position;
    }

    let angle = this.handAngle;
    let targetAngle = this.targetAngle;
    angle += (targetAngle - angle) / 20;
    if (Math.abs(angle - targetAngle) < 0.01) {
      angle = targetAngle;

      if (angle < 0) {
        this.targetAngle += Math.random() * 10;
      } else {
        this.targetAngle -= Math.random() * 10;
      }
    }
    this.handAngle = angle;
    this.element.style.transform = `rotate(${angle}deg)`;

    this.x++;
    if (this.x > 360) {
      this.x = 0;
    }

    requestAnimationFrame(this.handFrameFn);
  }

  /**
   *
   * @param {{x: number, y: number}} position
   * @private
   */
  handleMouseMove(position) {
    if (!this.isInitialized || this.isDisposed) {
      return;
    }
    this.targetHandFrame = Math.floor(lerp(0, this.frames.length, position.y + 0.5));
    this.targetAngle = lerp(-17, 17, position.x + 0.5);


  }
}