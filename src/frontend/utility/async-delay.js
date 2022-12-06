export default class AsyncDelay {
  /**
   *
   * @param {Function} callback
   */
  constructor(callback) {
    /**
     * @type {number}
     * @private
     */
    this.delayId = 0;

    /**
     * @type {Function}
     */
    this.callback = callback;
  }

  /**
   * Disposes Delay
   */
  dispose() {
    this.stop();
    this.callback = null;
  }

  /**
   *
   * @param {number} milliseconds
   */
  start(milliseconds) {
    this.stop();
    this.delayId = setTimeout(this.callback, milliseconds);
  }

  /**
   * Stops delay
   */
  stop() {
    if (this.delayId) {
      clearTimeout(this.delayId);
    }
  }
}