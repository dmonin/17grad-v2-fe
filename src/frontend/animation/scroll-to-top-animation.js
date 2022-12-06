import animation from './animation.js';
import easing from './easing.js';

const scrollToTopAnimation = (duration = 500) => {
  return new Promise((resolve, reject) => {
    if (window.scrollY == 0) {
      resolve();
      return;
    }

    document.body.style.overflow = 'hidden';
    animation([window.scrollY], [0], duration, easing.inAndOut, {
      onFrame: (values) => {
        window.scrollTo(0, values[0]);
      },
      onEnd: () => {
        document.body.style.overflow = '';
        resolve();
      }
    }).start();
  });
}

export default scrollToTopAnimation;