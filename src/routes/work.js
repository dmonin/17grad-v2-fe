const express = require('express');
const router = express.Router();
const textService = require('./../util/text-service');
const response = require('./../util/response');
const responsive = require('../util/responsive');
const Case = require('case');
const path = require('path');

// Preparing Project Data
const projectData = require('./../resources/json/projects.json');
const viewMeta = require('../util/view-meta');

function getProjectData(projectId, locale) {

  const texts = textService.get(locale);
  const data = {...projectData[projectId]};
  data.title_line1 = texts[`${projectId}.title.line1`];
  data.title_line2 = texts[`${projectId}.title.line2`];
  data.client = texts[`${projectId}.client`];
  data.clientShort = texts[`${projectId}.client.short`] || data.client;
  data.id = projectId;
  return data;
}

router.get('/', function(req, res, next) {
  const prefetchViewStyles = res.locals.prefetchViewStyles;
  prefetchViewStyles.splice(prefetchViewStyles.indexOf('view-work'), 1);

  const {isMobile, style, imageFormat } = res.locals;
  const projects = projectData.visible.map(projectId => {
    const data = getProjectData(projectId, res.locals.locale);
    data.image1 = responsive.image(`works-${style}/${data.image1}.${imageFormat.jpg}`);
    data.image2 = responsive.image(`works-${style}/${data.image2}.${imageFormat.jpg}`);
    return data;
  });

  const viewData = {
    ...viewMeta('work', res.locals.locale),
    projects,
    isMobile,
    style
  };
  response(req, res, 'work-list', viewData);
});

router.get('/:project', function(req, res, next) {
  const prefetchViewStyles = res.locals.prefetchViewStyles;
  prefetchViewStyles.splice(prefetchViewStyles.indexOf('view-work'), 1);
  const projectId = req.params.project;
  const project = getProjectData(projectId, res.locals.locale);

  if (!project) {
    res.render('not-found');
    return;
  }
  const {style, imageFormat } = res.locals;

  const images = responsive.glob(`work-${projectId}`);
  const media = {};

  // Media Images / Videos
  for (const image of images) {
    const imgName = Case.camel(path.basename(image));
    if (image.match(/(jpg|png)$/)) {
      media[imgName] = responsive.image(image);
    } else {
    media[imgName] = responsive.video(image);
    }
  }
  const templateName = 'projects/' + projectId;
  res.app.render(templateName, {
    projectId,
    media,
    texts: res.locals.texts
  }, (err, projectHtml) => {
    if (err) {
      console.error(err);
      res.render(err.message);
      return;
    }
    const projectName = project.client + ' – ' + project.title_line1 + ' ' + project.title_line2;

    response(req, res, 'work-detail', {
      ...viewMeta('work-detail', res.locals.locale, {
        projectName
      }),
      description: res.locals.texts[`${projectId}.intro.line1`],
      headerImage: responsive.image(`works-${style}/${project.image1}.${imageFormat.jpg}`),
      project,
      projectId,
      projectHtml
    }, {
      projectHtml
    });
  });
});


module.exports = router;
