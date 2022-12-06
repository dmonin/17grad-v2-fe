/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 */
export default (value, min, max) => {
  if (value < min) {
    return min;
  } else if (value > max) {
    return max;
  }
  return value;
}