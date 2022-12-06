const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const createError = require('http-errors');
const srcDir = './src';
const serverTiming = require('server-timing');
const useragent = require('express-useragent');
const compression = require('compression');
const glsl = require('glslify');

const indexRouter = require(srcDir + '/routes/index');
const apiRouter = require(srcDir + '/routes/api');
const workRouter = require(srcDir + '/routes/work');
const coreRouter = require(srcDir + '/routes/core');
const contactRouter = require(srcDir + '/routes/contact');
const imprintRouter = require(srcDir + '/routes/imprint');
const isDev = process.env.NODE_ENV == 'development';
const designStyle = require(srcDir + '/util/design-style');
const designStyleProperties = require(srcDir + '/util/design-style-properties');
const textService = require(srcDir + '/util/text-service');
const userLocale = require(srcDir + '/util/user-locale');
const sitemapService = require(srcDir + '/util/sitemap-service');

var app = express();

app.use(serverTiming());
app.use(compression());

// view engine setup
app.set('views', path.join(__dirname, srcDir + '/views'));
app.set('view engine', 'pug');
app.set('view cache', !isDev);
app.set('x-powered-by', false);


// HTTP REQUEST Logger
if (isDev) {
  const logger = require('morgan');
  // app.use(logger('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

if (isDev) {
  app.use('/js', express.static('./src/frontend'));
}

app.locals.domain = '17grad.com';
app.locals.isDev = isDev;
app.locals.scriptPath = process.env.SCRIPT_PATH || '/';
app.locals.staticPath = process.env.STATIC_PATH || '/';
app.locals.pretty = isDev;
app.use(async (req, res, next) => {
  if (req.path.match(/\/$/) && req.path != '/') {
    return res.redirect(req.path.replace(/\/$/, ''));
  }

  res.setHeader('Link', [
    `</service-worker.js>; rel="serviceworker"`,
    `<${req.protocol}://${req.hostname}${req.path}>; rel="canonical"`
  ]);

  res.setHeader('Access-Control-Allow-Origin', '*');

  if (!isDev) {
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=300');
  }

  // Locals
  const ua = useragent.parse(req.headers['user-agent']);
  const webpSupported = ua.isMobile || !ua.isSafari;
  res.locals.imageFormat = {
    jpg: webpSupported ? 'webp': 'jpg',
    png: webpSupported ? 'webp': 'png'
  };

  const locale = userLocale.urlLocale(req);

  if (!locale) {
    res.redirect('/');
    return;
  }

  if (locale != 'en') {
    res.locals.canonical = 'https://' + app.locals.domain + req.path.replace(/^\/(de|es)/, '');
  }

  res.locals.locale = locale;
  res.locals.baseUrl = locale != 'en' ? `/${locale}/` : '/';
  res.locals.rootUrl = locale != 'en' ? `/${locale}` : '/';

  res.locals.texts = await textService.fetchCached(locale);

  res.locals.isMobile = ua.isMobile;
  res.locals.isiPad = ua.isiPad;
  res.locals.isDev = isDev;
  res.locals.fromPath = req.query.from && req.query.from.replace(/\//g, ' ').trim();
  res.locals.prefetchViewStyles = [
    'view-index',
    'view-work',
    'view-play',
    'view-core',
    'view-contact',
    'view-imprint'
  ];
  res.locals.style = designStyle(req);
  res.locals.styleProps = designStyleProperties[res.locals.style];
  res.locals.prefetchStyles = ['corporate', 'progressive', 'brutal'].filter(s => s != res.locals.style);
  // if (!req.cookies.style) {
  //   res.cookie('style', res.locals.style, {
  //     maxAge: 1000 * 86400 * 365,
  //     httpOnly: false
  //   });
  // }
  next()
});

// Shaders
app.get('/shader/:shader', (req, res) => {
  const shaderPath = srcDir + '/resources/shaders/' + req.params.shader;
  let shaderSrc = null;

  try {
    shaderSrc = glsl.file(shaderPath);
  } catch (e) {

  }

  res.json({
    shader: shaderSrc
  });
});

app.use('/api', apiRouter);
app.use('/sitemap.xml', (req, res) => {
  const sitemap = sitemapService() + '';
  res.setHeader('Content-Type', 'text/xml');
  return res.send(sitemap);
});
app.use('(/de|/es)?', indexRouter);
app.use('(/de|/es)?/work', workRouter);
app.use('(/de|/es)?/core', coreRouter);
app.use('(/de|/es)?/contact', contactRouter);
app.use('(/de|/es)?/imprint', imprintRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
