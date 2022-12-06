'use strict';

export class AsyncThrottle {
  /**
   *
   * @param {Function} callback
   */
  constructor(callback) {
    /**
     * @number
     * @private
     */
    this.timerId = 0;

    /**
     * @type {Function}
     */
    this.callback = callback;

    /**
     * @type {Function}
     * @private
     */
    this.onFireFn = this.onFire.bind(this);
  }

  /**
   * Disposes Throttle
   */
  dispose() {
    this.stop();
    this.callback = null;
  }

  /**
   *
   * @param {number} milliseconds
   */
  fire(milliseconds) {
    if (this.timerId > 0) {
      return;
    }
    this.timerId = setTimeout(this.onFireFn, milliseconds);
  }

  /**
   * @private
   */
  onFire() {
    this.timerId = 0;
    if (this.callback) {
      this.callback();
    }
  }

  /**
   *
   */
  stop() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = 0;
    }
  }
}