import viewService from './view-service.js';
import eventService from './event-service.js';
import historyService from './history-service.js';
import Navigation from '../components/navigation.js';
import pageStyleService from './page-style-service.js';


async function handleStyleChange() {
  if (viewService.view.reloadOnStyleChange) {
    const url = pageStyleService.getUrl();
    historyService.updateState({
      path: url.pathname
    }, '', url.toString());
    await viewService.navigate(url.pathname);
  }
}

eventService.addEventListener("style-change", handleStyleChange);
eventService.addEventListener('internal-link:navigate', navigate);

eventService.addEventListener('history:popstate',
  (e) => {
    viewService.navigate(e.state.path, e.state);
  });

// Initializing Navigation
const menu = new Navigation({
  onNavigate: navigate
});
menu.decorate(document.body.querySelector('.navigation'));
const url = new URL(document.location.href);
menu.setActivePath(url.pathname);

historyService.updateState({
  path: url.pathname
}, '', url.toString());

/**
 *
 * @param {string} path
 * @param {Object=} state
 * @private
 */
async function navigate(path, state) {
  const url = pageStyleService.getUrl(path);

  historyService.pushState({
    path
  }, '', url.toString());

  if (menu.isExpanded) {
    await menu.toggle();
  }

  await viewService.navigate(path, state);
}

export default {
  menu,
  navigate
};