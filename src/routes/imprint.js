const express = require('express');
const router = express.Router();
const response = require('./../util/response');
const viewMeta = require('./../util/view-meta');

router.get('/', function(req, res, next) {
  const viewData = {
    ...viewMeta('imprint', res.locals.locale)
  };
  const prefetchViewStyles = res.locals.prefetchViewStyles;
  prefetchViewStyles.splice(prefetchViewStyles.indexOf('view-imprint'), 1);
  response(req, res, 'imprint', viewData);
});

module.exports = router;
