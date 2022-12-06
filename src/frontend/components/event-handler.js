export default class EventHandler {

  constructor(target) {
    /**
     * @private
     */
    this.target = target;

    /**
     * @private
     */
    this.listeners = [];
  }

  /**
   *
   * @param {Element} element
   * @param {string} type
   * @param {Function} listener
   * @param {Object} options
   */
  on(element, type, listener, options) {
    const handler = listener.bind(this.target);
    element.addEventListener(type, handler, options);
    this.listeners.push([element, type, handler, listener]);
  }

  /**
   *
   * @param {Element} element
   * @param {string} type
   * @param {Function} listener
   */
  off(element, type, listener) {
    const count = this.listeners.length;
    for (let i = count - 1; i >= 0; i--) {
      const l = this.listeners[i];
      if (l[3] == listener) {
        element.removeEventListener(type, l[2]);
        this.listeners.splice(i, 1);
        return;
      }
    }
    element.removeEventListener(type, listener);
  }

  dispose() {
    this.detachAll();
    this.target = null;
    this.listeners = null;
  }

  detachAll() {
    for (const listener of this.listeners) {
      const [element, type, handler] = listener;
      element.removeEventListener(type, handler);
    }
  }
}