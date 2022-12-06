import pageStyle from '../services/page-style-service.js';
import View from './view.js';
import corporateStyleComponents from '../style/style-index-corporate.js';
import progressiveStyleComponents from '../style/style-index-progressive.js';
import brutalStyleComponents from '../style/style-index-brutal.js';
import componentFactory from '../components/component-factory.js';
import scrollToTopAnimation from '../animation/scroll-to-top-animation.js';
import viewLoading from '../animation/view-loading.js';
export default class IndexView extends View {
  constructor(props) {
    super(props);

    this.name = 'index';
  }

  /**
   * @inheritDoc
   */
  componentFactory(element) {
    let cmp = super.componentFactory(element);
    if (cmp) {
      return cmp;
    }

    return componentFactory(element, this, this.getStyleFactory());
  }

  /**
   * @private
   */
  getStyleFactory() {

    switch (pageStyle.style) {
      case 'corporate':
        return corporateStyleComponents;

      case 'progressive':
        return progressiveStyleComponents;

      case 'brutal':
        return brutalStyleComponents;
    }
  }

  /** @inheritDoc */
  transitionIn(path) {
    if (path == null) {
      return super.transitionIn(path);
    }

    return new Promise(async (resolve, reject) => {
      if (viewLoading.isVisible()) {
        await viewLoading.hide(400);
      }

      const viewEl = this.childElement('.index');
      viewEl.classList.add('--view-in');
      setTimeout(() =>
        viewEl.removeAttribute('data-from'),
        20);

      setTimeout(() => {
        viewEl.classList.remove('--view-in');
        resolve();
      }, 2000);
    });
  }

  /** @inheritDoc */
  transitionOut(path) {
    const transition = [
      scrollToTopAnimation(1000),
      new Promise((resolve, reject) => {
        this.childElement('.index').classList.add('--view-out');
        setTimeout(resolve, 1500);
      })
    ];
    return Promise.all(transition);
  }
}