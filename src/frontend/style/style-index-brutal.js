import BrutalIndexNavigation from './brutal-index-navigation.js';
import BrutalHand from './brutal-hand.js';
import BrutalLogo from '../webgl/brutal-logo.js';

export default [
  {
    regex: /index__nav/,
    component: BrutalIndexNavigation
  },
  {
    regex: /brutal-hand/,
    component: BrutalHand
  },
  {
    regex: /index__logo__canvas/,
    component: BrutalLogo
  }
];
