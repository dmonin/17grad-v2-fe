const express = require('express');
const router = express.Router();
const fs = require('fs');
const glslify = require('glslify');
const cache = require('memory-cache');
const userLocale = require('../util/user-locale');

router.get('/locale', async(req, res, next) => {
  const locale = userLocale.bestMatchingLocale(req);
  res.json({
    locale
  });
});

router.get('/shaders', async (req, res, next) => {
  const shaders = req.query.shaders.split(',');
  const response = {};

  const cacheKey = 'shader-' + shaders.join('-');
  const cached = cache.get(cacheKey);
  if (cached) {
    res.json(cached);
    return;
  }

  for (const shader of shaders) {
    const shaderPath = '../resources/shaders/' + shader;
    if (shader.match(/^[a-z0-9-]+\.(frag|vert)$/i) && fs.existsSync('./src/resources/' + shaderPath)) {
      response[shader] = glslify.file(shaderPath);
    }
  }
  if (!res.locals.isDev) {
    cache.put(cacheKey, response);
  }

  res.json(response);
});

module.exports = router;
