import viewService from '../services/view-service.js';
import Component from './component.js';
import cursor from './cursor.js';
import eventService from '../services/event-service.js';
import pageStyleService from '../services/page-style-service.js';
export default class Navigation extends Component {
  /**
   *
   * @param {Object} props
   */
  constructor(props) {
    super(props);

    /**
     * @number
     * @private
     */
    this.timeout = 0;

    /**
     * @type {Element}
     */
    this.navButton = null;

    /**
     * @type {boolean}
     */
    this.isExpanded = false;
  }

  /**
   * @inheritDoc
   */
  enterDocument() {
    super.enterDocument();
    const openText = this.navButton.dataset['open'] || 'Open';

    this.on('click', this.handleNavButton, this.navButton);
    this.on('click', this.handleClick);
    this.on('click', this.handleClose, '.close');

    cursor.setHover(this, {
        cls: 'active',
        text: openText
      }, {
      element: this.navButton
    });

    cursor.initializeBasics(this);
  }

  /**
   * @private
   */
  handleClose() {
    if (this.isExpanded) {
      this.toggle();
    }
  }

  /**
   *
   * @param {MouseEvent} e
   * @private
   */
  handleClick(e) {
    const link = e.target.closest('a');
    if (!link || !link.href || link.rel=='redirect') {
      return;
    }

    const newUrl = new URL(link.href);
    const currentUrl = new URL(document.location.href);
    if (newUrl.hostname != currentUrl.hostname) {
      return;
    }

    e.preventDefault();
    this.props.onNavigate(newUrl.pathname);
  }

  /**
   *
   * @param {KeyboardEvent} e
   * @private
   */
  handleKeyDown(e) {
    if (e.key == 'Escape') {
      this.toggle();
    }
  }

  /**
   * @private
   */
  handleNavButton() {
    this.toggle();
  }

  /** @inheritDoc */
  setElement(element) {
    super.setElement(element);

    this.navButton = document.body.querySelector('.hamburger');
  }

  /**
   * Sets currently active menu item
   *
   * @param {string} path
   */
  setActivePath(path) {
    const currentlyActive = this.childElement('li.active');
    if (currentlyActive) {
      currentlyActive.classList.remove('active');
    }

    const currentItem = this.childElement(`li[data-path="${path}"]`);
    if (currentItem) {
      currentItem.classList.add('active');
    }
  }

  /**
   * Toggles Navigation
   */
  toggle() {
    clearTimeout(this.timeout);

    this.isExpanded = !this.isExpanded;
    const bodyCls = document.body.classList;

    // Expanding
    if (this.isExpanded) {
      this.setActivePath(viewService.view.state.path);
      this.element.style.display = 'block';
      bodyCls.remove('nav-expanded');
      this.timeout = setTimeout(() => {
        bodyCls.add('nav-expanded');
      }, 10);
      this.on('keydown', this.handleKeyDown, document.documentElement);
      eventService.dispatch('menu-open');
      this.updateRedirectUrls();
    // Collapsing
    } else {
      bodyCls.add('nav-out');
      this.timeout = setTimeout(() => {
        this.element.style.display = 'none';
        bodyCls.remove('nav-expanded');
        bodyCls.remove('nav-out');
      }, 800);
      this.off('keydown', this.handleKeyDown, document.documentElement);
      eventService.dispatch('menu-close');
    }

    return new Promise((resolve) => {
      setTimeout(resolve, 1000)
    });
  }

  /**
   * @private
   */
  updateRedirectUrls() {
    const links = this.childElements('a[rel=redirect]');
    for (const link of links) {
      const url = new URL(link.href);
      url.searchParams.set('s', pageStyleService.style.substr(0, 1));
      link.href = url.toString();
    }
  }
}