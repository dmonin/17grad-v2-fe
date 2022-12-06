import PlayArea from '../components/play-area.js';
import View from './view.js';
import loadJs from '../utility/load-js.js';
import loadCss from '../utility/load-css.js';

/**
 * @export
 * @class PlayView
 * @extends {View}
 */
export default class PlayView extends View {
  constructor() {
    super();

    /**
     * @type {Scrollable}
     */
    this.scrollable = null;

    /**
     * @type {PlayArea}
     */
    this.playArea = null;

    this.customComponents = [
      {
        regex: /play-area/,
        component: PlayArea
      }
    ];
  }

  /** @inheritDoc */
  enterDocument() {
    super.enterDocument();

    this.viewChildren.then(this.setupChildInteractions.bind(this));
  }

  /**
   * @private
   */
  setupChildInteractions() {
    this.playArea = this.child('play-area');
    this.scrollable = this.child('scrollable');
    this.scrollable.props.onProgress = this.updateProgress.bind(this);

    window['playView'] = this;
    loadJs('/third-party/play-editor.js');
    loadCss('https://fonts.googleapis.com/icon?family=Material+Icons');

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
    this.playArea.setProgress(position);
  }
}