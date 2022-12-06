import View from './view.js';
import HotSpot from '../components/hot-spot.js';
import HorizontalScrollSection from '../articles/horizontal-scroll-section.js';

/**
 * @export
 * @class PlayView
 * @extends {View}
 */
export default class ArticleView extends View {
  constructor() {
    super();

    this.customComponents = [
      {
        regex: /hotspot/,
        component: HotSpot
      },
      {
        regex: /article__horizontal__section/,
        component: HorizontalScrollSection
      }
    ];
  }

  /** @inheritDoc */
  enterDocument() {
    super.enterDocument();
    this.initializeAppearManager();
    this.initializeParallax();
  }
}