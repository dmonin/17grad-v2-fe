/**
 * Defines whether we are on touch device
 *
 * @returns boolean
 * @memberof App
 * @private
 */
export default () => {
  try {
    document.createEvent("TouchEvent");
    return true;
  } catch (e) {
    return false;
  }
}