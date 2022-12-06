import View from './view.js';
import pageStyle from '../services/page-style-service.js';
import componentFactory from '../components/component-factory.js';
import scrollToTopAnimation from '../animation/scroll-to-top-animation.js';
import viewLoading from '../animation/view-loading.js';
import corporateStyleComponents from '../style/style-core-corporate.js';
import progressiveStyleComponents from '../style/style-core-progressive.js';
import brutalStyleComponents from '../style/style-core-brutal.js';
import scrollService from '../services/scroll-service.js';


/**
 * @export
 * @class CoreView
 * @extends {View}
 */
export default class CoreView extends View {

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
  enterDocument() {
    super.enterDocument();

    this.initializeVideoManager();
    this.initializeAppearManager();
    this.initializeParallax({
      smoothLevel: window.innerWidth > 1024 ? 20 : 0
    });

    this.on('scroll', this.handleScroll, window);
  }

  /**
   * @private
   */
  handleScroll() {
    scrollService.setScrollPosition(window.scrollY, 'core-view');
  }

  /** @inheritDoc */
  transitionIn(path) {
    return new Promise(async (resolve, reject) => {
      setTimeout(() => {
        this.childElement('.core__header').classList.remove('--view-in');
        resolve();
      }, 50);

      if (viewLoading.isVisible()) {
        viewLoading.hide();
      }
    });
  }

  /** @inheritDoc */
  transitionOut(path) {
    const transition = [
      scrollToTopAnimation(500),
      new Promise((resolve, reject) => {
        const viewEl = this.childElement('.core');
        viewEl.classList.add('--view-out');
        viewLoading.show();
        setTimeout(resolve, 1000);
      })
    ];

    scrollService.unregister('core-view');

    return Promise.all(transition);
  }
}