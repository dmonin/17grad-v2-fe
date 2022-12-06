const express = require('express');
const router = express.Router();
const responsive = require('./../util/responsive');
const response = require('./../util/response');
const viewMeta = require('./../util/view-meta');

const getMediaByStyle = (style, format) => {
  let media = {};

  // Header
  if (style == 'brutal') {
    media.videoTeam = responsive.video('core-brutal/hero-anim');
  } else {
    media.imgTeam = responsive.image(`core-${style}/hero-desktop.${format.jpg}`);
  }

  // Photos
  if (style == 'brutal') {
    media = {
      ...media,
      videoSaschaDean: responsive.video(`core-brutal/01-dean-sascha`),
      imgInterior1: responsive.image(`core-brutal/01-interior.${format.jpg}`),
      videoGavin: responsive.video(`core-brutal/02-gavin`),
      videoNatalie: responsive.video(`core-brutal/03-natalie`),
      videoDmitry: responsive.video(`core-brutal/04-dmitry`)
    };
  } else if (style == 'progressive') {
    media = {
      ...media,
      imgInterior: responsive.image(`core-progressive/01-interior.${format.jpg}`),
      imgDiscussion1: responsive.image(`core-progressive/02-discussion.${format.jpg}`),
      imgDiscussion2: responsive.image(`core-progressive/03-discussion.${format.jpg}`),
    };
  } else if (style == 'corporate') {
    media = {
      ...media,
      imgInterior: responsive.image(`core-corporate/01-interior.${format.jpg}`),
      imgHandshake: responsive.image(`core-corporate/02-handshake.${format.jpg}`),
      imgDiscussion: responsive.image(`core-corporate/03-discussion.${format.jpg}`)
    };
  }

  // Values
  if (style != 'corporate') {
    media.imgValueHonesty = responsive.image(`core-${style}/hand-swear.${format.png}`);
    media.imgValueAdaptive = responsive.image(`core-${style}/hand-dog.${format.png}`);
    media.imgValueExcellence = responsive.image(`core-${style}/hand-excellent.${format.png}`);
  }

  // People
  if (style == 'brutal') {
    media.imgOnePeople = responsive.image(`core-${style}/team-onepeople.${format.jpg}`);
    media.videoOnePeople = responsive.video(`core-brutal/team-anim`);
  } else {
    media = {
      ...media,
      imgDmitry: responsive.image(`core-${style}/team-dmitry-a.${format.jpg}`),
      imgDean: responsive.image(`core-${style}/team-dean-a.${format.jpg}`),
      imgGavin: responsive.image(`core-${style}/team-gavin-a.${format.jpg}`),
      imgSascha: responsive.image(`core-${style}/team-sascha-a.${format.jpg}`),
      imgNatalie: responsive.image(`core-${style}/team-natalie-a.${format.jpg}`),
      imgWorkWithUs: responsive.image(`core-${style}/04-work-with-us.${format.jpg}`)
    };
  }

  if (style == 'corporate') {
    media = {
      ...media,
      imgDmitryHover: responsive.image(`core-${style}/team-dmitry-b.${format.jpg}`),
      imgDeanHover: responsive.image(`core-${style}/team-dean-b.${format.jpg}`),
      imgGavinHover: responsive.image(`core-${style}/team-gavin-b.${format.jpg}`),
      imgSaschaHover: responsive.image(`core-${style}/team-sascha-b.${format.jpg}`),
      imgNatalieHover: responsive.image(`core-${style}/team-natalie-b.${format.jpg}`)
    }
  } else if (style == 'progressive') {
    media = {
      ...media
      // videoDmitryHover: responsive.video(`progressive-dmitry`)
    };
  }

  return media;
}

const getViewData = (res) => {
  const {style, isMobile, isiPhone, imageFormat} = res.locals;
  const clients = [
    'x-bionic',
    'lih',
    'lpi',
    'razorfish',
    'interhome',
    '1und1',
    'medicover',
    'aecero',
    'daesk',
    'hhd',
    'diagnos',
    'followred',
    'interchalet',
    'medicover-genetics',
    'schloessliwoerth',
    'smart7',
    'smartminds',
    'socialmoms',
    'veracity',
    'wunschkinder',
  ];

  // res.startTime('view-data', 'Generating View Data');
  const viewData = {
    clients,
    style,
    isMobile,
    isiPhone,
    videoAttrInlineVideo: {
      loop: true,
      autoplay: true,
      muted: true,
      crossorigin: true,
      playsinline: true
    },
    media: getMediaByStyle(style, imageFormat)
  };

  // res.endTime('view-data');
  return viewData;
}



/* GET home page. */
router.get('/', function(req, res, next) {
  const viewData = getViewData(res);

  const prefetchViewStyles = res.locals.prefetchViewStyles;
  prefetchViewStyles.splice(prefetchViewStyles.indexOf('view-core'), 1);

  response(req, res, 'core', {
    ...viewMeta('core', res.locals.locale),
    ...viewData
  });
});

module.exports = router;
