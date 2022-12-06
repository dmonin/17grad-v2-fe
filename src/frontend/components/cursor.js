import isTouchDevice from '../utility/is-touch-device.js';
import Component from './component.js';
import spriteIcon from './sprite-icon.js';
import hello from '../utility/hello.js';
import pageStyle from '../services/page-style-service.js';

const isCursorAvailable = !isTouchDevice();
class Cursor extends Component {
  constructor() {
    super();

    /**
     * @type {Element}
     * @private
     */
    this.bgElement = null;

    /**
     * @type {{cls: string, text?: string, icon?: string}}
     */
    this.currentState = '';

    /**
     * @type {{cls: string, text?: string, icon?: string}}
     */
    this.previousState = '';

    /**
     * @private
     */
    this.garbageCollectorFn = this.garbageCollector.bind(this);
  }


  /**
   * Create new DOM state
   * @param {{cls: string, text?: string, icon?: string}} state
   * @return {Element}
   * @private
   */
  createStateDom(state) {
    const stateDom = document.createElement('div');
    stateDom.className = 'cursor-state --in';
    if (state.text) {
      stateDom.innerHTML = '<span class="cursor-state__text">' + state.text + '</span>';
    }
    if (state.icon) {
      stateDom.appendChild(spriteIcon(state.icon));
    }
    return stateDom;
  }

  /** @inheritDoc */
  enterDocument() {
    super.enterDocument();

    if (isCursorAvailable) {
      this.on('pointermove', this.handleMouseMove, document.documentElement);
      this.element.style.display = 'block';
      this.bgElement.style.display = 'block';
    }
  }

  /**
   * Disposes old nodes
   * @private
   */
  garbageCollector() {
    const outElements = this.childElements('.--out');
    for (const el of outElements) {
      this.element.removeChild(el);
    }
  }

  /**
   * @param {MouseEvent} e
   */
  handleMouseMove(e) {
    if (this.currentState && (this.currentState.text || this.currentState.icon)) {
      this.element.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    }

    this.bgElement.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
  }

  /**
   * Resets state
   */
  reset() {
    this.setState({
      cls: ''
    });
  }

  /**
   * @param {Component} component
   * @param {{cls: string, text?: string, icon?: string}} state
   * @param {object} config
   */
  setHover(component, state, cfg) {
    cfg = cfg || {};
    component.on('mouseenter', (e) => {
      this.setState(state);
    }, cfg.element);

    component.on('mouseleave', () => {
      this.reset();
    }, cfg.element);
  }

  /**
   * Initializes base cursors
   * @param {Component} component
   */
  initializeBasics(component) {
    const elements = component.childElements('[data-cursor]');

    for (const element of elements) {
      const [cls, text, icon] = element.dataset.cursor.split(',');
      this.setHover(component, {
        cls, text, icon
      }, {
        element
      });
    }
  }

  /**
   * @param {{cls: string, text?: string, icon?: string}} state
   */
  setState(state) {
    const element = this.element;
    const bg = this.bgElement;

    if (!isCursorAvailable) {
      return;
    }

    if (state.icon == 'eye' || state.icon == 'drag') {
      state.icon = pageStyle.style + '-' + state.icon;
      if (pageStyle.style != 'corporate') {
        state.text = '';
      }
    }

    if (state.cls == 'hi') {
      if (pageStyle.style == 'brutal') {
        state.text = '';
        state.icon = 'brutal-hi';
      } else {
        const random = Math.floor(Math.random() * hello.length);
        state.text = hello[random];
      }
    }

    if (this.currentState && this.currentState.cls) {
      element.classList.remove(`--${this.currentState.cls}`);
      bg.classList.remove(`--${this.currentState.cls}`);
    }

    if (state.cls) {
      element.classList.add(`--${state.cls}`);
      bg.classList.add(`--${state.cls}`);
    }

    this.previousState = this.currentState;
    this.currentState = state;

    this.replaceStateDom(state);
    this.delay(this.garbageCollectorFn, 2000, 'gc');
  }

  /**
   *
   * @param {{cls: string, text?: string, icon?: string}} state
   * @private
   */
  replaceStateDom(state) {
    const currentStates = this.childElements('.cursor-state');
    for (const el of currentStates) {
      el.classList.add('--out');
    }

    const stateDom = state.icon || state.text ? this.createStateDom(state) : null;
    if (stateDom) {
      this.element.appendChild(stateDom);
      setTimeout(() => stateDom.classList.remove('--in'), 10);
    }
  }

  setElement(element) {
    super.setElement(element);
    this.bgElement = document.getElementById('cursor-bg');
  }
}

const cursor = new Cursor();
export default cursor;
