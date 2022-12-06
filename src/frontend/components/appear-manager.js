'use strict';

import InteractionObserverManager from "./interaction-observer-manager.js";

/**
 * @export
 * @class LazyVideoManager
 * @extends {InteractionObserverManager}
 */
export default class AppearManager extends InteractionObserverManager {
  /**
   * @inheritDoc
   */
  handleIntersection(entries, observer) {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const target = entry.target;
        const appearDuration = Number(target.dataset.appearDuration) || 2000;
        const appearVisibility = Number(target.dataset.appearVisibility) || 0.2;
        if (entry.intersectionRatio < appearVisibility) {
          return;
        }
        // console.log('Appear', target.nodeName + '.' + target.className);

        target.classList.add('--appear-in');

        setTimeout(() => {
          target.classList.remove('--appear-in');
          target.classList.remove('appear');
        }, appearDuration);

        this.observer.unobserve(target);
      }
    }
  }
}