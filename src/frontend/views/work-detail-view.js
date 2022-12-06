import View from './view.js';
import httpHeaders from '../utility/http-headers.js';
import scrollToTopAnimation from '../animation/scroll-to-top-animation.js';
import viewLoading from '../animation/view-loading.js';
import pageStyleService from '../services/page-style-service.js';
import scrollService from '../services/scroll-service.js';
import progressiveStyleComponents from '../style/style-work-progressive.js';
import componentFactory from '../components/component-factory.js';
import pageStyle from '../services/page-style-service.js';
/**
 * @export
 * @class WorkView
 * @extends {View}
 */
export default class WorkView extends View {

  constructor(props = {}) {
    super(props);

    this.name = 'work-detail';

    this.reloadOnStyleChange = false;
  }

  /**
   * Creates header DOM structure
   * It's necessary for the smooth transition from the overview page
   * @param {Element} image Primary Image element
   * @param {Element} title Title Element from the Slide
   * @param {string} name Project ID
   */
  createHeaderDom(image, title, projectName) {
    // Main element
    const dom = document.createElement('header');
    dom.style.setProperty('--color1', this.props.projectColor1)
    dom.style.setProperty('--color2', this.props.projectColor2)
    dom.className = 'work-detail-header';

    // Adding image
    dom.appendChild(image);

    // Headline
    const headline = document.createElement('h1');
    headline.className = 'appear';
    const lines = title.querySelectorAll('span');
    for (const line of lines) {
      const el = document.createElement('div');
      el.className = 'text-line';
      el.innerHTML = [`<span class="text-line-content">`,
        line.textContent,
        '</span>'].join('');
      headline.appendChild(el);
    }
    dom.appendChild(headline);

    // Logo
    const img = new Image();
    img.src = `/svg/work-${projectName}/logo.svg`;
    img.className = 'client-logo appear';
    dom.appendChild(img);
    return dom;
  }

  /**
   * Creates content DOM structure
   */
  createContentDom() {
    const dom = document.createElement('section');
    dom.className = 'work-detail';
    dom.style.setProperty('--color1', this.props.projectColor1);
    dom.style.setProperty('--color2', this.props.projectColor2);
    return dom;
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

    if (!this.childElement('.work-detail') && this.props.projectName) {
      this.loadContent().then(this.initialize.bind(this));
    } else {
      this.delay(this.initialize.bind(this), 1000);
    }

    this.on('scroll', this.handleScroll);
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
  handleScroll() {
    scrollService.setScrollPosition(window.scrollY);
  }

  /**
   * Initializes pages videos & appear animations
   * @private
   */
  async initialize() {
    this.initializeAppearManager();
    this.initializeVideoManager();
  }

  /**
   * Loads Page Content (in case we move from work overview)
   * @private
   */
  loadContent() {
    return new Promise(async (resolve, reject) => {
      const dom = this.createContentDom();
      const url = new URL(document.location.href);
      url.searchParams.set('s', pageStyleService.style.substr(0, 1));
      url.pathname = 'work/' + this.props.projectName;
      const response = await fetch(url.toString(), {
        headers: httpHeaders()
      });
      const json = await response.json();
      dom.innerHTML = json['projectHtml'];
      this.element.appendChild(dom);
      await this.initializeChildren(dom);
      resolve();
    });
  }

  /**
   * @inheritDoc
   */
  transitionIn() {
    return new Promise((resolve) => {
      if (viewLoading.isVisible()) {
        viewLoading.hide();
        setTimeout(resolve, 500);
      } else {
        resolve();
      }
    });
  }

  /**
   * @inheritDoc
   */
  transitionOut(newPath) {
    this.childElement('.work-detail').classList.add('--out');
    if (newPath.match(/work$/)) {
      document.body.appendChild(this.childElement('header'));
      return scrollToTopAnimation();
    }

    const transition = [
      scrollToTopAnimation(500),
      new Promise((resolve, reject) => {
        const headerEl = this.childElement('header');
        headerEl.classList.add('--out');
        headerEl.style.opacity = 0;
        viewLoading.show();
        setTimeout(resolve, 1000);
      })
    ];

    return Promise.all(transition);

  }
}