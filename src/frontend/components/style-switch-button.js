import httpHeaders from '../utility/http-headers.js';
import cursor from './cursor.js';
import Component from './component.js';
import shapePath from '../style/style-shape-path.js';
import clamp from '../math/clamp.js';
import eventService from '../services/event-service.js';
import localeService from '../services/locale-service.js';

/**
 * Menu Component DOM
 *
 * @type {Promise<Element>}
 * @private
 */
let componentDom = null;

/**
 * Menu Component
 *
 * @type {StyleSwitchMenu}
 * @private
 */
let styleSwitchMenu = null;

/**
 * Texts for each style which are displayed in Style Switch menu.
 *
 * @type {Object}
 * @private
 */
let texts = null;

/**
 * Fetches HTML of the Style Switch Menu
 * @return {Promise<Element>}
 * @private
 */
function fetchStyleSwitchMenu() {
  return new Promise(async (resolve, reject) => {
    try {
      const base = localeService.baseHref;
      const res = await fetch(base + 'style-switch', {
        headers: httpHeaders()
      });
      const json = await res.json();
      const div = document.createElement('div');
      div.innerHTML = json['html'];
      texts = json['texts'];
      resolve(div.firstElementChild);
    } catch(e) {
      reject(e);
    }
  });
}

export default class StyleSwitchButton extends Component {
  constructor(props) {
    super(props);

    /**
     * @type {boolean}
     */
    this.isVisible = false;

    /**
     * @type {string}
     * @private
     */
    this.currentPosition = '';
  }

  /** @inheritDoc */
  enterDocument() {
    super.enterDocument();

    // Cursor
    this.on('mouseenter', () => {
      cursor.setState({cls: 'style-hover'});
    });

    this.on('mouseleave', () => {
      cursor.reset();
    });

    this.on('pointerenter', () => {
      if (!componentDom) {
        componentDom = fetchStyleSwitchMenu();
      }
    });

    this.on('click', this.toggleMenu);

    this.on('request-style-change', this.toggleMenu, eventService);
  }

  /**
   * Sets button at random position,
   * to current moment directly after
   * page load.
   */
  randomPosition() {
    if (this.currentPosition) {
      this.element.classList.remove(this.currentPosition);
    }
    const positions = ['left', 'top', 'right'];
    const index = Math.floor(Math.random() * positions.length);
    this.element.classList.add(positions[index]);

    let random = clamp(Math.round(Math.random() * 100), 30, 70);

    // top in the middle
    if (index == 1 && random > 40 && random < 60) {
      random = clamp(Math.round(Math.random() * 100), 60, 80);
    }

    this.element.style.setProperty('--position', `${random}%`);
  }

  /**
   * @param {boolean} isVisible
   */
  setVisible(isVisible) {
    const classList = this.element.classList;
    if (isVisible) {
      classList.add('--visible');
    } else {
      classList.remove('--visible');
    }
  }

  /**
   * Toggles Style Switch Menu
   */
  async toggleMenu() {
    if (!componentDom) {
      componentDom = await fetchStyleSwitchMenu();
    }

    import('./style-switch-menu.js').then(async (menu) => {
      const el = await componentDom;
      if (!styleSwitchMenu) {
        styleSwitchMenu = new menu.default({
          onClose: this.toggleMenu.bind(this),
          texts
        });
        styleSwitchMenu.setElement(el);
      }

      this.isVisible = !this.isVisible

      if (this.isVisible) {
        document.body.classList.add('--overlay-open');
        document.body.appendChild(el);
        styleSwitchMenu.enterDocument();
        styleSwitchMenu.setVisible(this.isVisible);
      } else {
        const styleChanged = this.props.onStyleChange(styleSwitchMenu.style);
        if (styleChanged) {
          await styleSwitchMenu.showMagic();
        }

        document.body.classList.remove('--overlay-open');
        styleSwitchMenu.setVisible(this.isVisible);

        setTimeout(() => {
          document.body.removeChild(el);
          styleSwitchMenu.exitDocument();
        }, 1000);
      }
    });
  }

  /**
   *
   * @param {string} style
   */
  setStyle(style) {
    this.childElement('path').setAttribute('d', shapePath[style]);
  }
}
