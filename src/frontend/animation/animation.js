'use strict';

/**
 * @fileoverview Minimal Module for basic requestAnimationFrame Animations
 * @author Dmitry Monin
 */

/**
 * Starts animation
 */
const start = function(){
  if (this.isPlaying) {
    return false;
  }

  this.isPlaying = true;
  this.progress = 0;
  this.coords = [...this.from];
  const now = +new Date();
  this.startTime = now;
  this.endTime = now + this.ms;
  this.lastFrame = now;
  this.frameFn = this.frame.bind(this);
  this.frame(now);
  return true;
};

/**
 * Stops animation
 * @param {boolean} goToEnd
 */
const stop = function(goToEnd) {
  if (!this.isPlaying) {
    return;
  }

  if (goToEnd) {
    this.progress = 1;
  }

  this.isPlaying = false;
  this.updateValue(this.progress);

  if (this.props.onEnd) {
    this.props.onEnd();
  }
}

/**
 * Executes on each frame
 */
const frame = function() {
  const now = +new Date();
  this.progress = (now - this.startTime) / this.ms;
  if (this.progress > 1) {
    this.progress = 1;
  }
  this.fps = 1000 / (now - this.lastFrame);
  this.lastFrame = now;

  if (this.progress == 1) {
    this.stop();
  } else {
    this.updateValue(this.progress);
    if (this.props.onFrame) {
      this.props.onFrame(this.value);
    }
  }

  if (this.isPlaying) {
    requestAnimationFrame(this.frameFn);
  }
}

/**
 * Updates value on each frame
 */
const updateValue = function(t) {
  if (this.easing) {
    t = this.easing(t);
  }

  this.value = [];
  for (let i = 0; i < this.from.length; i++) {
    this.value[i] = (this.to[i] - this.from[i]) * t + this.from[i];
  }
}

/**
 * @param {Array<number>} from Start value
 * @param {Array<number>} to End value
 * @param {number} ms Duration of animation
 * @param {Function=} easing Easing Function
 * @param {{onEnd?: Function, onFrame?: Function}} props
 */
export default (from, to, ms, easing, props) => {
  props = props || {};
  return {
    from,
    to,
    ms,
    easing,
    start,
    stop,
    frame,
    updateValue,
    props
  };
};

