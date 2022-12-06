import View from './view.js';
import viewLoading from '../animation/view-loading.js';

/**
 * @export
 * @class CoreView
 * @extends {View}
 */
export default class ImprintView extends View {
  /** @inheritDoc */
  transitionIn(path) {
    return new Promise(async (resolve, reject) => {
      if (viewLoading.isVisible()) {
        viewLoading.hide();
      }
      resolve(true);
    });
  }
}