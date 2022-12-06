import View from './view.js';
import ProgressSlider from '../components/progress-slider.js';
import workExpandAnimation from '../animation/work-expand-animation.js';
import historyService from '../services/history-service.js';
import scrollService from '../services/scroll-service.js';
import viewLoading from '../animation/view-loading.js';
import progressiveStyleComponents from '../style/style-work-progressive.js';
import componentFactory from '../components/component-factory.js';
import pageStyle from '../services/page-style-service.js';

/**
 * @export
 * @class WorkView
 * @extends {View}
 */
export default class WorkView extends View {

  constructor(props) {
    super(props);

    /**
     * @type {ProgressSlider}
     * @private
     */
    this.progress = null;

    /**
     * @type {Scrollable}
     * @private
     */
    this.scrollable = null;

    /**
     * @type {number}
     * @private
     */
    this.lastMouseDown = +new Date();

    /**
     * @type {number}
     * @private
     */
    this.lastMove = +new Date();

    this.customComponents.push({
      regex: /progress-slider/,
      component: ProgressSlider
    });
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

  /** @inheritDoc */
  enterDocument() {
    super.enterDocument();
    this.viewChildren.then(this.setupSlider.bind(this));

    const buttons = this.childElements('.work-list__slide__button,.work-list__slide__image,.work-list__slide__content');
    for (const button of buttons) {
      this.on('pointerdown', this.handleProjectMouseDown, button);
      this.on('click', this.handleProjectClick, button);
    }

    // Initializing parallax
    this.initializeParallax();
    this.initializeAppearManager();
  }

  /**
   * @private
   */
   getStyleFactory() {

    switch (pageStyle.style) {
      case 'corporate':
        return null;

      case 'progressive':
        return progressiveStyleComponents;

      case 'brutal':
        return null;
    }
  }

  /**
   * @private
   */
  handleNext() {
    if (this.progress.currentIndex < this.progress.count) {
      this.scrollable.snap(this.progress.currentIndex + 1);
    }
  }

   /**
   * @param {MouseEvent} e
   * @private
   */
  handleProjectMouseDown(e) {
    this.lastMouseDown = +new Date();
    this.lastMove = 0;
  }

  /**
   * @param {MouseEvent} e
   * @private
   */
  handleProjectClick(e) {
    const now = +new Date();

    // Evaluating for drag & drop
    if (now - this.lastMouseDown > 300 || Math.abs(this.lastMove) > 10) {
      return;
    }

    // Getting clicked slide
    const slide = e.currentTarget.closest('.work-list__slide');
    if (!slide.dataset.name) {
      return;
    }

    // Updating history state, even if we are not on the slide yet
    const slides = this.childElements('.work-list__slide');
    let index = 0;
    for (const s of slides) {
      if (slide == s) {
        break;
      }
      index++;
    }
    historyService.updateState({
      index
    });

    // Starting Animation
    scrollService.unregister('work-view');

    const viewEl = this.childElement('.work-view');
    viewEl.classList.add('--view-out-to-project');
    slide.classList.add('--current');

    workExpandAnimation(slide);

    // In order to speed up animations,
    // we already can get rid of all background JS
    // for components rendered on the page
    this.exitDocument();
    this.dispose();
  }

  /**
   * @override
   */
  initializeParallax() {
    this.parallax.observerSettings.root = this.childElement('.work-list');
    this.parallax.observerSettings.rootMargin = '0px 100000px 0px 100000px';
    this.parallax.setElement(this.element);
    this.parallax.smoothLevel = 0;
    this.parallax.enterDocument();
    this.parallax.axis = 'x';
  }

  /**
   *
   * @param {number} index
   * @private
   */
  updateItemIndex(index) {
    historyService.updateState({
      index
    });
    this.progress.setItemIndex(index);
  }

  /**
   *
   * @param {number} percent
   * @param {number} position
   * @param {number} total
   * @param {number} delta
   * @private
   */
  updateProgress(percent, position, total, delta) {
    this.lastMove += delta;
    this.parallax.setPosition(position * -1);
    this.progress.setValue(percent);
    this.lastMouseDown = +new Date();
    scrollService.setScrollPosition(position, 'work-view');
  }

  /**
   * @private
   */
  setupSlider() {
    const scrollable = this.child('scrollable');
    scrollable.props.snap = true;
    scrollable.props.onProgress = this.updateProgress.bind(this);
    scrollable.props.onItemChange = this.updateItemIndex.bind(this);
    this.scrollable = scrollable;

    const progress = this.child('progress');
    progress.props.onNext = this.handleNext.bind(this);
    progress.setItemCount(scrollable.getItemCount());
    progress.setVisible(true);
    this.progress = progress;

    if (this.state.index) {
      scrollable.snap(this.state.index, true);
    } else {
      historyService.updateState({
        index: 0
      });
    }

    const headerFromWorkDetail = document.body.querySelector('.work-detail-header');
    if (headerFromWorkDetail) {
      const stateIndex = this.state.index || 1;
      const img = this.childElement(`.scrollable__item:nth-child(${Number(stateIndex + 1)}) .work-list__slide__image img`);
      const rect = img.getBoundingClientRect();
      headerFromWorkDetail.style.left = rect.left + 'px';
      headerFromWorkDetail.style.top = rect.top + 'px';
      headerFromWorkDetail.style.width = rect.width + 'px';
      headerFromWorkDetail.style.height = rect.height + 'px';
      headerFromWorkDetail.classList.add('--out');

      const projectEl = this.childElement(`.scrollable__item:nth-child(${Number(stateIndex + 1)}`);
      projectEl.classList.add('--appearing');

      // headerFromWorkDetail.style.opacity = 0;
      setTimeout(() => {
        projectEl.classList.remove('--appearing');
        document.body.removeChild(headerFromWorkDetail);
      }, 1000);
    }
  }

  /** @inheritDoc */
  transitionIn() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.childElement('.work-view').classList.remove('--appearing');
      }, 1000);


      if (viewLoading.isVisible()) {
        viewLoading.hide();
        setTimeout(resolve, 500);
      } else {
        resolve();
      }
    });
  }

  /** @inheritDoc */
  transitionOut(path) {
    return new Promise((resolve, reject) => {
      scrollService.unregister('work-view');

      const viewEl = this.childElement('.work-view');
      viewEl.classList.add('--view-out');
      viewLoading.show();
      setTimeout(resolve, 1500);
    });
  }
}