import lerp from './lerp.js';

/**
 * Constant used to approximate ellipses.
 * See: http://canvaspaint.org/blog/2006/12/ellipse/
 * @type {number}
 */
const KAPPA = 4 * (Math.sqrt(2) - 1) / 3;

export class Bezier {
  constructor({x0, x1, x2, y0, y1, y2}) {
    /**
     * X coordinate of the first point.
     * @type {number}
     */
    this.x0 = x0;

    /**
     * Y coordinate of the first point.
     * @type {number}
     */
    this.y0 = y0;

    /**
     * X coordinate of the first control point.
     * @type {number}
     */
    this.x0 = x0;

    /**
     * Y coordinate of the first control point.
     * @type {number}
     */
    this.y0 = y0;

    /**
     * X coordinate of the second control point.
     * @type {number}
     */
    this.x1 = x1;

    /**
     * Y coordinate of the second control point.
     * @type {number}
     */
    this.y1 = y1;

    /**
     * X coordinate of the end point.
     * @type {number}
     */
    this.x2 = x2;

    /**
     * Y coordinate of the end point.
     * @type {number}
     */
    this.y2 = y2;
  }

  point(p0, p1, p2, t) {
    return p1 + (1 - t) ** 2 * (p0 - p1) + t ** 2 * (p2 - p1);
  }

  /**
   *
   * @param {number} t
   */
  x(t) {
    return this.point(this.x0, this.x0, this.x1, t);
  }

  /**
   *
   * @param {number} t
   */
  y(t) {
    return this.point(this.y0, this.y0, this.y1, t);
  }

}