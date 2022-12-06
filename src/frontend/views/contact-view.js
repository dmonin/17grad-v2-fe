import FormInput from '../components/form-input.js';
import TagSelect from '../components/tag-select.js';
import BudgetSlider from '../components/budget-slider.js';
import View from './view.js';
import httpHeaders from '../utility/http-headers.js';
import shapePath from '../style/style-shape-path.js';
import pageStyleService from '../services/page-style-service.js';
import eventService from '../services/event-service.js';
import viewLoading from '../animation/view-loading.js';
import scrollToTopAnimation from '../animation/scroll-to-top-animation.js';

/**
 * @export
 * @class ContactView
 * @extends {View}
 */
export default class ContactView extends View {
  constructor(props) {
    super(props);

    this.customComponents = [
      {
        regex: /budget-slider/,
        component: BudgetSlider
      },
      {
        regex: /tag-select/,
        component: TagSelect
      },
      {
        regex: /form-input/,
        component: FormInput
      }
    ];

  }

  /** @inheritDoc */
  enterDocument() {
    super.enterDocument();
    this.on('style-change', this.handleStyleChange, eventService);
    this.setStyle(pageStyleService.style);
    this.on('submit', this.handleSubmit, '.form');
    this.on('click', this.handleStyleSwitchButton, '.contact__finish button');
    this.initializeAppearManager();
  }

  /**
   * @return {Object}
   * @private
   */
  getFormData() {
    const inputs = this.childElements('input');
    const data = {};
    for (const input of inputs) {
      data[input.name] = input.value;
    }
    data['message'] = this.childElement('textarea').value;
    data['budget'] = this.child('budget').getValue();
    data['tags'] = this.child('tags').selected;
    return data;
  }

  /**
   * @param {string}
   * @private
   */
  handleStyleChange(style) {
    this.setStyle(style);
  }

  /**
   * @private
   */
  handleStyleSwitchButton() {

    // pageStyleService.button.toggleMenu();
  }

  /**
   * @param {Event} e
   * @private
   */
  async handleSubmit(e) {
    e.preventDefault();

    const response = await fetch('/contact', {
      method: 'post',
      body: JSON.stringify(this.getFormData()),
      headers: httpHeaders()
    });
    const json = await response.json();

    if (json['success']) {
      gtag('event', 'generate_lead');
      this.successView();
    }
  }

  /**
   *
   * @param {string} style
   * @private
   */
  setStyle(style) {
    this.childElement('button path').setAttribute('d', shapePath[style]);
  }

  /**
   * @private
   */
  successView() {
    window.scrollTo({
      left: 0,
      top: 0,
      behavior: 'smooth'
    });

    const formData = this.getFormData();
    this.childElement('.name').innerHTML = ` ${formData['name']} `;

    setTimeout(() => {
      this.childElement('.contact').classList.add('--out');
    }, 500);

    setTimeout(() => {
      this.childElement('.contact').classList.remove('--out');
      this.childElement('.contact').classList.add('--finish');
    }, 1500);

  }

  /** @inheritDoc */
  transitionIn() {
    return new Promise((resolve) => {
      if (viewLoading.isVisible()) {
        viewLoading.hide();
        setTimeout(resolve, 500);
      } else {
        resolve();
      }

    });
  }

  /** @inheritDoc */
  transitionOut() {
    const transition = [
      scrollToTopAnimation(200),
      new Promise((resolve, reject) => {
        viewLoading.show();
        const viewEl = this.childElement('.contact');
        viewEl.classList.add('--view-out');
        setTimeout(resolve, 1350);
      })
    ];
    return Promise.all(transition);
  }
}