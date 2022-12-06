import { ProgressiveClientList } from './progressive-client-list.js';
import ProgressiveMemberPicture from './progressive-member-picture.js';
import { ProgressiveBackgroundCircles } from './progressive-background-circles.js';

export default [
  {
    regex: /core__clients__logo/,
    component: ProgressiveClientList
  },
  {
    regex: /progressive-member-picture/,
    component: ProgressiveMemberPicture
  },
  {
    regex: /background-circles/,
    component: ProgressiveBackgroundCircles
  }
];