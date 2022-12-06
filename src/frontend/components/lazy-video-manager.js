'use strict';

import InteractionObserverManager from "./interaction-observer-manager.js";

/**
 * @export
 * @class LazyVideoManager
 * @extends {InteractionObserverManager}
 */
export default class LazyVideoManager extends InteractionObserverManager {
  /**
   * @inheritDoc
   */
  handleIntersection(entries, observer) {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const video = entry.target;

        video.src = video.dataset.src;
        video.load();
        observer.unobserve(video);
      }
    }
  }
}