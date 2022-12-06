'use strict';

// More functions:
// https://easings.net/

/**
 * @param {number} t Input between 0 and 1.
 * @param {number} exp Ease exponent.
 * @return {number} Output between 0 and 1.
 * @private
 */
const easeInInternal = (t, exp) => Math.pow(t, exp);

/**
 * @param {number} t Input between 0 and 1.
 * @param {number} exp Ease exponent.
 * @return {number} Output between 0 and 1.
 * @private
 */
const easeOutInternal = (t, exp) => 1 - easeInInternal(1 - t, exp);


export default {
  easeIn: t => easeInInternal(t, 3),
  easeOut: t => easeOutInternal(t, 3),
  inAndOut: t => 3 * t * t - 2 * t * t * t,
  inOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
  inOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
};