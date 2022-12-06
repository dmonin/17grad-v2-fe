import eventService from './event-service.js';

const scrollContainers = new Map();
let max = 10;

function frame() {
  let activeScrolling = false;
  scrollContainers.forEach((container, areaName) => {
    const diff = container.target - container.position;
    if (Math.abs(diff) < 1) {
      container.position = container.target;
    } else {
      activeScrolling = true;
      container.position += diff / 500;
    }

    const speed = Math.abs(diff / 500);
    max = Math.max(max, speed);

    const scrollOffset = speed / max;
    eventService.dispatch('scroll-offset', scrollOffset, {
      areaName,
      direction: container.direction,
      position: container.position,
      target: container.target
    });
  });

  if (activeScrolling) {
    requestAnimationFrame(frame);
  }
}

export default {
  /**
   * Registers if not yet done for new observator for scroll momentum on specific area
   *
   * @param {string} areaName
   * @param {number} position
   * @param {string} direction
   */
  register: (areaName, position, direction = 'y') => {
    scrollContainers.set(areaName, {
      position,
      direction,
      target: position
    });
  },

  /**
   * Unregisters scroll momentum observation
   * @param {string} areaName
   */
  unregister: (areaName) => {
    scrollContainers.delete(areaName);
  },

  /**
   * Sets scroll position for specific area
   * Also registers if not yet done for new observator for scroll momentum on specific area
   * @param {number} position
   * @param {string} areaName
   * @param {string} direction
   */
  setScrollPosition(position, areaName, direction = 'y') {
    if (!scrollContainers.has(areaName)) {
      this.register(areaName, position);
    }
    scrollContainers.get(areaName).target = position;

    eventService.dispatch('scroll', position, {
      areaName,
      direction
    });

    requestAnimationFrame(frame);
  }
};