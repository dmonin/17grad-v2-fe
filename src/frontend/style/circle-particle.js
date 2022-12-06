import animation from "../animation/animation.js";
import easing from "../animation/easing.js";
import { Bezier } from "../math/bezier.js";
import { uniformRandom } from "../math/uniform-random.js";



/**
 * @type {number}
 */
 const MIN_X = 0;

 /**
  * @type {number}
  */
 const MAX_X = 1;

 /**
  * @type {number}
  */
 const MIN_Y = 0;

 /**
  * @type {number}
  */
 const MAX_Y = 1;
export default class CircleParticle {

  constructor(size) {
    /**
     * X coordinate
     *
     * @type {number}
     * @private
     */
    this.x = Math.random() > 0.5 ? 0.1 : 0.9;

    /**
     * Y coordinate
     *
     * @type {number}
     * @private
     */
    this.y = Math.random() > 0.5 ? 0.1 : 0.9;

    /**
     * @type {number}
     */
    this.offsetY = 0;

    /**
     * @type {number}
     */
    this.size = size;

    /**
     * @type {number}
     */
    this.currentSize = 0.01;

    /**
     * End point
     * @type {number[]}
     * @private
     */
    this.bezier = this.generateBezier();

    /**
     * Move animation
     */
    this.moveAnimation = animation([0], [1], 10000, easing.inOutSine, {
      onFrame: (value) => {
        this.time = value[0];
      },
      onEnd: () => {
        this.reset();
      }
    });

    /**
     * Circle Time; always: 0 <= t <= 1
     * @type {number}
     * @private
     */
    this.time = 0;

    /**
     * Time speed increement
     * @type {number}
     * @private
     */
    this.increment = 0.005;

    /**
     * @private
     */
    this.sizeAnimation = animation([this.currentSize], [this.size], 5000, easing.easeOut, {
      onFrame: (value) => {
        this.currentSize = value[0];
      },
      onEnd: () => {
        this.sizeAnimation = null;
      }
    });

    this.sizeAnimation.start();
    this.moveAnimation.start();
  }

  /**
   * Creates new Bezier move function
   * @private
   */
  generateBezier() {
    const endX = Math.random() > 0.5
      ? uniformRandom(0, 0.33)
      : uniformRandom(0.66, 1);

    return new Bezier({
      x0: this.x,
      y0: this.y,
      x1: Math.random(),
      y1: Math.random(),
      x2: endX,
      y2: Math.random()
    });
  }

  /**
   * @returns x and y position
   */
  getPosition() {
    return [this.x, this.y + this.offsetY];
  }

  /**
   * Returns matrix column with: x, y positions and size
   */
  getColumn() {
    return [this.x, this.y + this.offsetY, this.currentSize];
  }

  /**
   * Returns whether circle is out of bounds on the x axis
   */
  isOutOfBoundsX() {
    return this.x < -.2 || this.x > 1.2;
  }

  /**
   * Returns whether circle is out of bounds on the y axis
   */
  isOutOfBoundsY() {
    const [_, y] = this.getPosition();
    return y < -.2 || y > 1.2;
  }

  /**
   * Making different timing function for moving circles
   * @private
   */
  moveToNextTarget() {
    this.bezier = this.generateBezier();
    this.time = 0;
    this.moveAnimation.ms = Math.random() * 10000 + 10000;
    this.bezier = this.generateBezier();
    this.moveAnimation.stop(true);
    this.moveAnimation.start();
  }

  /**
   * Sets start point to end point and generates new random values for
   * controlPoint and end values. Also sets time to 0
   */
  reset(assignCornerPosition = false) {
    if (assignCornerPosition) {
      this.x = Math.random() > 0.5 ? -0.15 : 1.15;
      this.y = Math.random() > 0.5 ? -0.15 : 1.15;
      this.offsetY = 0;
    }
    this.moveToNextTarget();
  }

  /**
   * Sets circle's coordinates to chosen coordinates,
   * resets path / Bezier attributes
   * @param {number} x
   * @param {number} y
   */
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   *
   * @param {CircleParticle} circle
   */
  setToPosition(circle) {
    this.x = circle.x;
    this.y = circle.y;
    this.offsetY = circle.offsetY;
  }

  // /**
  //  * Sets circle either to top or bottom bound
  //  * @param {number} boundValue either 1 or -1
  //  */
  // setToBound(boundValue) {
  //   if (boundValue < 0) {
  //     this.setPosition(this.x, this.yMax);
  //   } else if (boundValue > 0) {
  //     this.setPosition(this.x, this.yMin);
  //   }
  // }

  /**
   * Updates circle parameters
   */
  update() {
    this.x = this.bezier.x(this.time);
    this.y = this.bezier.y(this.time);
  }
}
