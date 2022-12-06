import httpHeaders from "../utility/http-headers.js";
import { splitText } from "../utility/split-text.js";

/**
 * This file is structured a little bit differently.
 * It has some private methods at the top. And public in the class.
 */


const messages = {
  'de': ['Möchtest du in die _Deutsche_ Version wechseln?', 'Ja, _Deutsch_ wäre mir lieber. Danke.'],
  'en': ['Would you like to switch to _English_?', 'Yes, I would prefer _English_. Thanks.'],
  'es': ['Versione spagnola?', 'Sie']
};
let isVisible = false;
let hideTimeoutId = 0;

function toggle() {
  const el = document.body.querySelector('.language-switch');
  isVisible = !isVisible;
  if (isVisible) {
    el.classList.add('visible');
  } else {
    el.classList.add('out');
    setTimeout(() => {
      document.body.removeChild(el);
    }, 3000);
  }
}

function messageInDiv(message, cls) {
  const div = document.createElement('div');
  div.className = cls;
  div.innerHTML = splitText(message);
  return div;
}

function hideLater() {
  hideTimeoutId = setTimeout(toggle, 5000);
}


export class LocaleService {
  constructor() {
    /**
     * Current Locale
     *
     * @type {string}
     */
    this.currentLang = document.documentElement.lang;

    /**
     * Base Href
     *
     * @type {string}
     */
    this.baseHref = document.documentElement.querySelector('base').getAttribute('href');
  }

  /**
   * @private
   */
  async checkLocale() {
    const response = await fetch('/api/locale', {
      headers: httpHeaders(),
    });

    const json = await response.json();
    if (json['locale'] != this.currentLang) {
      const message = messages[json['locale']];
      const messageDiv = document.createElement('div');
      messageDiv.className = 'language-switch';
      messageDiv.appendChild(messageInDiv(message[0], 'line'));
      messageDiv.appendChild(messageInDiv(message[1], 'line'));
      document.body.appendChild(messageDiv);
      messageDiv.addEventListener('click', () => {
        document.location.href = json['locale'] != 'en' ? `/${json['locale']}/` : '/';
      });

      messageDiv.addEventListener('mouseenter', () => {
        clearTimeout(hideTimeoutId);
      });
      messageDiv.addEventListener('mouseleave', hideLater);
      setTimeout(toggle, 50);
      hideLater();
    }
  }

  initialize() {
    setTimeout(this.checkLocale.bind(this), 3000);
    // const cookieLocale = cookie().pref_locale;
    // if (!cookieLocale) {
    //   document.cookie = 'pref_locale=' + this.currentLang;
    // }
    // const url = new URL(document.location.href);
    // const segments = url.pathname.split('/');
    // if (this.currentLang != 'en' && segments.length > 1
    //   && this.currentLang != segments[1] && segments[1] != 'api') {
    //   url.pathname = this.currentLang  + url.pathname;
    //   historyService.updateState({}, '', url);
    // }
  }
}

const localeService = new LocaleService();

export default localeService;