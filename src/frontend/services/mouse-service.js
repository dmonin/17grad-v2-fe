import eventService from './event-service.js';

let viewportSize = null;
const position = {x: 0, y: 0, pageX: 0, pageY: 0};
const body = document.body;

/**
 *
 * @param {MouseEvent} e
 */
function handleMouseMove(e) {
  position.pageX = e.clientX;
  position.pageY = e.clientY;
  position.x = (e.clientX - viewportSize.width / 2) / viewportSize.width;
  position.y = (e.clientY - viewportSize.height / 2) / viewportSize.height;

  body.style.setProperty('--mouse-x', position.x);
  body.style.setProperty('--mouse-y', position.y);
  eventService.dispatch('mousemove', position);
}

function updateViewportSize() {
  viewportSize = {
    width: window.innerWidth,
    height: window.innerHeight
  };
}

export default {
  initialize: () => {

    updateViewportSize();
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', updateViewportSize);
  }
};