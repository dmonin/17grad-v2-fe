const refreshRect = function(position) {
  const rect = this.element.getBoundingClientRect();
  this.cachedRect = {
    cached: true,
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    time: +new Date(),
    position
  };
  return rect;
}

const rect = function(position, axis = 'y', interval = null) {
  const time = +new Date();
  interval = typeof interval == 'number' ? interval : this.interval;
  if (this.cachedRect && time - this.cachedRect.time < interval) {
    const rect = {
      ...this.cachedRect,
    };
    const dPos = rect.position - position;

    if (axis == 'x') {
      rect.left -= dPos;
    } else {
      rect.top += dPos;
    }

    return rect;
  }
  return this.refreshRect(position);
};

export default (element, interval = 3000) => {
  return {
    cachedRect: null,
    element,
    refreshRect,
    interval,
    rect
  };
}