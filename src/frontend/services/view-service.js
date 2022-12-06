import stylesheetService from "./stylesheet-service.js";
import httpHeaders from "../utility/http-headers.js";
import View from "../views/view.js";
import pageStyleService from "./page-style-service.js";

const body = document.body;
let titleTimerId = 0;

/**
 * Typewriter effect for the page title
 * @param {string} title
 */
function updatePageTitle(title, current = "") {
  clearTimeout(titleTimerId);
  const newTitle = current + title.substr(0, 1);
  document.title = newTitle;
  if (title.length > 1) {
    titleTimerId = setTimeout(
      () => updatePageTitle(title.substr(1), newTitle),
      250
    );
  }
}

/**
 * Container where view contents are rendered.
 *
 * @type {Element}
 */
const viewContainerElement = body.querySelector("#view-content");

/**
 * Returns name of the css file for the view
 * @param {string=} path
 * @return {string}
 * @private
 */
function getViewCss(path) {
  if (!path) {
    const location = new URL(document.location.href);
    path = location.pathname;
  }
  if (path.match(/^\/?(de|es)?$/)) {
    return "view-index";
  } else if (path.match(/\/work/i)) {
    return "view-work";
  } else if (path.match(/\/core/i)) {
    return "view-core";
  } else if (path.match(/\/play/i)) {
    return "view-play";
  } else if (path.match(/\/contact/i)) {
    return "view-contact";
  } else if (path.match(/\/imprint/i)) {
    return "view-imprint";
  } else if (path.match(/\/careers/i)) {
    return "view-careers";
  }

  return "";
}

/**
 * Loads and updates view Content
 * @param {string} path
 * @param {string=} fromPath
 * @return {Promise<string>}
 * @private
 */
function loadViewHtml(path, fromPath) {
  return new Promise(async (resolve, reject) => {
    console.log("XHR Load " + path);
    body.classList.add("loading");
    try {
      body.classList.remove("loading");
      const loadUrl = pageStyleService.getUrl(path);
      loadUrl.searchParams.set('json', '1');
      if (fromPath) {
        loadUrl.searchParams.set('from', fromPath.replace(/\/(de|es)\//, '/'));
      }

      const response = await fetch(loadUrl.toString(), {
        headers: httpHeaders(),
      });

      const json = await response.json();
      if (json) {
        resolve({
          title: json["title"],
          html: json["html"],
        });
      } else if (json["error"]) {
        reject(new Error(json["error"]));
      }
    } catch (e) {
      console.error(e);
    }
  });
}

/**
 *
 * @param {string} path
 * @return {Promise<View>}
 */
function viewFactory(path) {
  return new Promise((resolve, reject) => {
    if (path.match(/^\/?(de|es)?$/)) {
      import("../views/index-view.js").then((indexView) => {
        resolve(new indexView.default());
      });
    } else if (path.match(/\/core$/)) {
      import("../views/core-view.js").then((coreView) => {
        resolve(new coreView.default());
      });
    } else if (path.match(/\/work$/)) {
      import("../views/work-view.js").then((workView) => {
        resolve(new workView.default());
      });
    } else if (path.match(/\/work\/[a-z-]+$/i)) {
      import("../views/work-detail-view.js").then((workDetailView) => {
        resolve(new workDetailView.default());
      });
    } else if (path.match(/\/contact$/)) {
      import("../views/contact-view.js").then((contactView) => {
        resolve(new contactView.default());
      });
    } else if (path.match(/\/play$/)) {
      import("../views/play-view.js").then((playView) => {
        resolve(new playView.default());
      });
    } else if (path.match(/\/careers$/)) {
      import("../views/careers-view.js").then((careersView) => {
        resolve(new careersView.default());
      });
    } else if (path.match(/\/imprint$/)) {
      import("../views/imprint-view.js").then((imprintView) => {
        resolve(new imprintView.default());
      });
    } else if (path.match(/\/article\/performance/)) {
      import("../articles/performance-article.js").then((performanceArticle) => {
        resolve(new performanceArticle.default());
      });
    } else if (path.match(/\/article/)) {
      import("../views/article-view.js").then((articleView) => {
        resolve(new articleView.default());
      });
    } else {
      resolve(new View({}));
    }
  });
}

class ViewService {
  constructor() {
    /**
     * Currently visible view
     * @type {View}
     */
    this.view = null;
  }

  /**
   * Destroys current view
   * @param {string=} newPath
   */
  async destroyView(newPath) {
    document.body.dataset.view = "";

    if (this.view) {
      if (this.view.state.path != newPath) {
        await this.view.transitionOut(newPath);
      }

      this.view.dispose();
      this.view = null;
    }
  }

  initialize() {
    const url = new URL(document.location.href);
    const pathname = url.pathname;
    viewFactory(pathname).then((view) => {
      view.state.path = url.pathname;
      this.setViewContent(view);
      view.transitionIn(null);
      view.enterDocument();
    });
  }

  /**
   * Navigates to certain view by path.
   *
   * @param {string} path state
   * @param {Object=} state optional history state
   * @return {Promise<View>}
   */
  navigate(path, state) {
    return new Promise(async (resolve, reject) => {
      console.log("Navigating to " + path);

      // Scheduling disabling for view stylesheet
      const currentPath = this.view && this.view.state && this.view.state.path;
      console.log('Current path ', currentPath);
      const oldCss = getViewCss(currentPath);
      const newCss = getViewCss(path);
      console.log("CSS", oldCss, newCss);
      if (oldCss != newCss) {
        // Getting enabling view stylesheet
        stylesheetService.enable(newCss, true);
      }

      // Loading view contents
      const viewPromise = viewFactory(path);
      const loadPromises = [];
      try {
        const oldView = this.view;

        loadPromises.push(viewPromise);
        const oldPath =
          oldView.state.path != path ? oldView.state.path : undefined;
        loadPromises.push(loadViewHtml(path, oldPath));

        await this.destroyView(path);

        if (oldCss != newCss) {
          setTimeout(() => {
            // Checking it's still the same view
            const currentCss = getViewCss();
            if (currentCss == oldCss) {
              console.log("CSS Disabling " + oldCss);
              stylesheetService.enable(oldCss, false);
            }
          }, 1000);
        }

        const [view, viewData] = await Promise.all(loadPromises);
        viewContainerElement.innerHTML = viewData.html;
        if (state) {
          view.state = state;
        }

        if (viewData.title) {
          document.title = "";
          updatePageTitle(viewData.title);
          gtag('event', 'page_view', {
            page_title: viewData.title,
            page_path: path
          });
        }

        this.setViewContent(view);
        view.state.path = path;
        if (oldView.state.path != path) {
          await view.transitionIn(oldView.state.path);
        }
        view.enterDocument();

        resolve(view);
      } catch (e) {
        console.error(e);
        viewContainerElement.innerHTML = e.message;
      }
    });
  }

  /**
   *
   * @param {View} view
   */
  setViewContent(view) {
    view.setElement(viewContainerElement);
    this.view = view;
    if (view.name) {
      document.body.dataset.view = view.name;
    }
  }
}

const viewService = new ViewService();
export default viewService;
