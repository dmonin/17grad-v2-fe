const express = require('express');
const router = express.Router();
const response = require('./../util/response');
const viewMeta = require('./../util/view-meta');

router.get('/', (req, res, next) => {
  const viewData = {
    ...viewMeta('index', res.locals.locale)
  };
  const prefetchViewStyles = res.locals.prefetchViewStyles;
  prefetchViewStyles.splice(prefetchViewStyles.indexOf('view-index'), 1);
  response(req, res, 'index', viewData);
});

router.get('/style-switch', function(req, res, next) {
  const texts = {};
  const labels = ['corporate', 'progressive', 'brutal'];
  for (const label of labels) {
    const textKey = `style-switch.${label}.text`;
    texts[label] = res.locals.texts && res.locals.texts[textKey] || textKey;
  }

  res.app.render('ui/style-switcher', {
    texts: res.locals.texts
  }, (err, html) => {
    res.json({
      html,
      texts
    });
  });
});

router.get('/offline.html', (req, res) => {
  res.render('offline', {});
});

module.exports = router;
