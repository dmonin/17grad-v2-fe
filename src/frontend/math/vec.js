export default class Vec {

  /**
   * @param {number} x
   * @param {number} y
   */
  constructor(x = 0, y = 0) {
    /**
     * @type {number}
     */
    this.x = x;

    /**
     * @type {number}
     */
    this.y = y;
  }

  /**
   *
   * @param {Vec} vec
   */
  add(vec) {
    this.x += vec.x;
    this.y += vec.y;
    return this;
  }

  /**
   * @return {Vec}
   */
  clone() {
    return new Vec(this.x, this.y);
  }

  /**
   * @param {Vec} vec
   */
  delta(vec) {
    return new Vec(this.x - vec.x, this.y - vec.y);
  }
  /**
   * @return {boolean}
   */
  magnitude() {
    return Math.hypot(this.x, this.y);
  }

  /**
   *
   * @param {number} angle The angle, in radians.
   */
  rotate(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const newX = this.x * cos - this.y * sin;
    const newY = this.y * cos + this.x * sin;
    this.x = newX;
    this.y = newY;
    return this;
  }

  /**
   * @param {number} x
   * @param {number=} y
   */
  scale(x, y = x) {
    this.x *= x;
    this.y *= y;
    return this;
  }


  /**
   *
   * @param {number} scale
   */
  scaleMagnitude(scale) {
    let magnitude = this.magnitude();
    const angle = Math.atan2(this.y, this.x);
    magnitude *= scale;

    this.x = Math.cos(angle) * magnitude;
    this.y = Math.sin(angle) * magnitude;
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  set(x, y) {
    this.x = x;
    this.y = y;
  }
}