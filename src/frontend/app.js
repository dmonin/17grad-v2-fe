import Logo from './components/logo.js';
import isTouchDevice from './utility/is-touch-device.js';
import stylesheetService from './services/stylesheet-service.js';
import pageStyleService from './services/page-style-service.js';
import navigationService from './services/navigation-service.js';
import mouseService from './services/mouse-service.js';
import viewService from './services/view-service.js';
import cursor from './components/cursor.js';
import browserDetection from './utility/browser-detection.js';
import StyleSwitchButton from './components/style-switch-button.js';
import localeService from './services/locale-service.js';
import canvasService from './services/canvas-service.js';
import authService from './services/auth-service.js';
import loadJs from './utility/load-js.js';
export default class App {

  /**
   * @param {Object} cfg
   */
  constructor(cfg = {}) {
    /**
     * @type {Logo}
     */
    this.logo = null;

    /**
     * @private
     */
    this.navigation = navigationService;
  }

  /**
   * Initializes App
   */
  initialize() {
    console.log('Initializing...');

    // Scroll restoration
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = "manual";
    }

    // Removing noscript DOM
    const body = document.body;
    const ns = body.querySelector('noscript');
    if (ns) {
      body.removeChild(ns);
    }

    if (!isTouchDevice()) {
      body.classList.add('no-touch');
    } else {
      body.classList.add('touch');
    }
    cursor.decorate(document.getElementById('cursor'));

    // Initializing Logo
    this.logo = new Logo();
    this.logo.decorate(body.querySelector('.logo'));

    localeService.initialize();
    viewService.initialize();
    mouseService.initialize();

    window.addEventListener('load', () => {
      stylesheetService.enable('animations');
    });

    browserDetection();

    // Initializing Style Switch Button
    const btnElement = document.body.querySelector('.style-switch-button');
    const styleSwitchButton = new StyleSwitchButton({
      onStyleChange: (style) => {
        if (style != pageStyleService.style) {
          pageStyleService.setStyle(style);
          styleSwitchButton.setStyle(pageStyleService.style);
          return true;
        }
        return false;
      }
    });
    styleSwitchButton.decorate(btnElement);
    styleSwitchButton.setStyle(pageStyleService.style);
    styleSwitchButton.randomPosition();
    canvasService.initialize();

    authService();

    setTimeout(() => styleSwitchButton.setVisible(true), 2000);
    setTimeout(() => {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/service-worker.js");
      }
    }, 3000);

    setTimeout(() => {
      loadJs("https://www.googletagmanager.com/gtag/js?id=G-QXMTWEXJQB");
    }, 5000);
  }
}

