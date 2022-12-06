export class EventDispatcher {
  constructor() {
    /**
     * @type {Map<string, Array<Function>>}
     * @private
     */
    this.listenerMap = new Map();
  }

  /**
   *
   * @param {string} eventName
   * @param {...*} params
   */
  dispatch(eventName, ...params) {
    const listeners = this.listenerMap.get(eventName);
    if (listeners) {
      for (const listener of listeners) {
        listener.apply(window, params);
      }
    }
  }

  /**
   *
   * @param {string} eventName
   * @param {Function} listener
   */
  addEventListener(eventName, listener) {
    if (!this.listenerMap.has(eventName)) {
      this.listenerMap.set(eventName, []);
    }

    const listeners = this.listenerMap.get(eventName);
    listeners.push(listener);
  }

  /**
   *
   * @param {string} eventName
   * @param {Function} listener
   */
  removeEventListener(eventName, listener) {
    const listeners = this.listenerMap.get(eventName);
    if (listeners) {
      for (let i = listeners.length; i >= 0; --i) {
        if (listeners[i] == listener) {
          listeners.splice(i, 1);
        }
      }
    }
  }
}

const globalEventService = new EventDispatcher();
export default globalEventService;