import viewService from '../services/view-service.js';
import historyService from '../services/history-service.js';
import localeService from '../services/locale-service.js';
import pageStyleService from '../services/page-style-service.js';

const viewContainer = document.getElementById('view-content');


function step1CreateExpandHtml(slide) {
  const baseUrl = localeService.baseHref;
  const image = slide.querySelector('.work-list__slide__image img');
  const title = slide.querySelector('.project-title');
  const projectName = slide.dataset.name || '';
  const projectColor1 = slide.dataset.color1 || '';
  const projectColor2 = slide.dataset.color2 || '';
  slide.classList.add('--expanding');

  const workView = slide.closest('.work-view');
  workView.classList.add('--expanding');

  const topButton = workView.querySelector('.top-button');
  topButton.classList.add('appear');

  return new Promise((resolve, reject) => {
    import('../views/work-detail-view.js').then(module => {
      const imageClone = image.cloneNode();
      const workDetailView = /** @type {WorkDetailView} */ new module.default({
        projectName,
        projectColor1,
        projectColor2
      });
      workDetailView.state.path = baseUrl + 'work/' + projectName;
      const headerDom = workDetailView.createHeaderDom(imageClone, title, projectName);
      headerDom.classList.add('--in');
      const imageRect = image.getBoundingClientRect();

      // Positioning Work View Header aligned with image
      headerDom.style.left = imageRect.left + 'px';
      headerDom.style.top = imageRect.top + 'px';
      headerDom.style.width = imageRect.width + 'px';
      headerDom.style.height = imageRect.height + 'px';

      // Hiding original image
      image.style.visibility = 'hidden';

      viewContainer.appendChild(headerDom);
      setTimeout(() => {
        headerDom.classList.remove('--in');
        resolve([headerDom, workDetailView]);
      }, 50);
    });
  });

}

function step2ScaleHeader(header) {
  return new Promise((resolve, reject) => {
    document.body.querySelector('.work-view').classList.add('--out-to-detail');
    header.style.left = '0px';
    header.style.top = '0px';
    header.style.width = window.innerWidth + 'px';
    header.style.height = window.innerHeight + 'px';
    header.style.opacity = 1;

    setTimeout(() => {
      header.style.width = '';
      header.style.height = '';
      resolve();
    }, 1000);
  });
}

/**
 *
 * @param {WorkDetailView} view
 */
function step3WorkDetailContent(workDetailView) {
  // Destroying current view
  viewService.view.dispose();
  viewService.view = null;
  const workView = document.body.querySelector('.work-view');

  viewContainer.removeChild(workView);
  viewService.setViewContent(workDetailView);
  workDetailView.enterDocument();
}

/**
 * @param {Element} slide
 */
export default async (slide) => {
  document.body.classList.add('--view-transition');

  // Creating header with image at exact location of image
  const [workDetailHeader, workDetailView] = await step1CreateExpandHtml(slide);
  const url = pageStyleService.getUrl(workDetailView.state.path);
  historyService.pushState({
    path: workDetailView.state.path
  }, '', url.toString());

  // Scaling Header Up
  await step2ScaleHeader(workDetailHeader);

  // // Initializing Work-Detail 1View
  await step3WorkDetailContent(workDetailView);

  document.body.classList.remove('--view-transition');
}
