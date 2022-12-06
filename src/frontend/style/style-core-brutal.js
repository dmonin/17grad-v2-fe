import { BrutalClientList } from './brutal-client-list.js';
import BrutalOnePeople from './brutal-one-people.js';

export default [
  {
    regex: /core__clients__logo/,
    component: BrutalClientList
  }, {
    regex: /core__people__picture/,
    component: BrutalOnePeople
  }
];