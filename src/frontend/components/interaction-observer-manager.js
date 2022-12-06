export default class InteractionObserverManager {
  constructor(props) {
    /**
     * @type {Object}
     * @private
     */
    this.props = props;

    const threshold = props.threshold || 0.1;

    /**
     * @type {IntersectionObserver}
     * @protected
     */
    this.observer = new IntersectionObserver(this.handleIntersection.bind(this), {
      threshold
    });
  }

  /**
   * Disposes video observer
   */
  dispose() {
    this.observer && this.observer.disconnect();
    this.observer = null;
  }

  /**
   * Initializes the observer, returnes list of observed elements.
   * @param {Element} element Root Element for Observer
   * @return {NodeList}
   */
  initialize(element) {
    const elements = element.querySelectorAll(this.props.selector);
    for (let i = 0; i < elements.length; i++) {
      this.observer.observe(elements[i]);
    }
    return elements;
  }

  /**
   *
   * @param {Array<IntersectionObserverEntry>} entries
   * @param {IntersectionObserver} observer
   * @protected
   */
  handleIntersection(entries, observer) {

  }
}