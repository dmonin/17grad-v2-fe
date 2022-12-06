export default {
  /**
   * @param {string} id
   * @param {boolean} isEnabled
   * @private
   */
  enable: (id, isEnabled = true) => {
    const link = document.getElementById(`style-${id}`);
    if (link) {
      link.rel = isEnabled ? 'stylesheet' : 'preconnect';
    }
  }
};