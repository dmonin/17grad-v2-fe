import { CorporateClientList } from './corporate-client-list.js';
import { CorporateTeamPicture } from './corporate-team-picture.js';

export default [{
  regex: /core__clients__list/,
  component: CorporateClientList
}, {
  regex: /core__people__member__picture/,
  component: CorporateTeamPicture
}];