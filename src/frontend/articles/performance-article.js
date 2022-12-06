import View from '../views/view.js';
import HotSpot from '../components/hot-spot.js';
import HorizontalScrollSection from './horizontal-scroll-section.js';
import { LoaderItem } from './performance/loader-item.js';

/**
 * @export
 * @class PlayView
 * @extends {View}
 */
export default class PerformanceArticle extends View {
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
      },
      {
        regex: /loading-anim/,
        component: LoaderItem
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