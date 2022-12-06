import Scrollable from './scrollable.js';
import Component from './component.js';
import ResponsiveVideo from './responsive-video.js';
import ResponsiveImage from './responsive-image.js';
import InternalLink from './internal-link.js';
import TopButton from '../components/top-button.js';
import Marquee from '../components/marquee.js';
import WorkSlideImage from '../components/work-slide-image.js';

const wrap = (parentComponent, component, element) => {
  if (parentComponent) {
    const name = element.dataset.name;
    parentComponent.addChild(component, name);
    component.decorate(element);
  }
};

/**
 * @type {Array<{regex: RegExp, component: Function, observe?: boolean}}
 */
const defaultConfig = [
  {
    regex: /top-button/,
    component: TopButton
  },
  {
    regex: /resp-img-bg/,
    component: ResponsiveImage
  },
  {
    regex: /responsive-video/,
    component: ResponsiveVideo
  },
  {
    regex: /scrollable\b/,
    component: Scrollable
  },
  {
    regex: /internal-link/,
    component: InternalLink
  },
  {
    regex: /marquee/,
    component: Marquee
  },
  {
    regex: /work-list__slide__image/,
    component: WorkSlideImage
  }
];

/**
 * @param {Element} element
 * @param {Component} parentComponent
 * @param {Array<{regex: RegExp, component: Function, observe?: boolean}} cfg
 * @return {Promise<Component>|null}
 */
export default (element, parentComponent, cfg = defaultConfig) => {
  for (const matcher of cfg) {
    if (element.className.match(matcher.regex)) {
      const cmp = new matcher.component();
      wrap(parentComponent, cmp, element);
      return Promise.resolve(cmp);
    }
  }

  return null;
};