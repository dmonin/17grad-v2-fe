const responsiveImg = require("./responsive-img");
const responsiveVideo = require("./responsive-video");
const fs = require('fs');
const glob = require('glob');
const json = require('../resources/json/responsive.json');

const publicPath = src => src.replace(new RegExp('./public/', 'g'), process.env.STATIC_PATH || '/');

for (const k in json) {
  json[k] = json[k].poster ? {
    poster: publicPath(json[k].poster),
    srcSet: json[k].srcSet.map((item) => ({
      src: publicPath(item.src),
      imgSrc: publicPath(item.imgSrc),
      width: item.width,
      height: item.height
    })),
    sizes: json[k].sizes,
    width: json[k].width,
    height: json[k].height
  } : {
    srcset: publicPath(json[k].srcset),
    width: json[k].width,
    height: json[k].height
  }
}

module.exports = {
  glob: (pattern) => {
    return Object.keys(json)
      .filter(
        path => path.match(pattern) &&
        !path.match(/webp$/)
      )
      .map(path =>
        path.replace('./public/img/', '')
          .replace('./public/video/', '')
          .replace(/-[0-9]+\.mp4/, '.mp4')
        );
  },
  image: (name) => {
    // const cacheKey = 'resp-img' + img;
    // const cached = cache.get(cacheKey);
    // if (cached) {
    //   return cached;
    // }
    const path = './public/img/' + name;
    if (!json[path]) {
      throw new Error('Image not found ' + path);
    }
    return json[path];
  },
  video: (name) => {
    name = name.replace('.mp4', '');
    const path = './public/video/' + name;
    if (!json[path]) {
      throw new Error('Video not found ' + path);
    }
    return json[path];
  },
  json: () => {
    const data = {};
    const images = glob.sync('./src/resources/img/**/*.{jpg,png}');
    for (const img of images) {
      if (!img.match(/\/[0-9]+\//)) {
        const jpg = img.replace('./src/resources', './public');
        data[jpg] = responsiveImg(jpg);
        const webp = jpg.replace(/(jpg|png)/, 'webp');
        data[webp] = responsiveImg(webp);
      }
    }

    const videos = glob.sync('./public/video/**/*.mp4');
    const videoFilePattern = /-[0-9]+\.mp4/i;
    for (const video of videos) {
      if (!video.match(videoFilePattern)) {
        continue;
      }

      const name = video.replace(videoFilePattern, '');
      if (data[name]) {
        continue;
      }
      data[name] = responsiveVideo(name);
    }

    fs.writeFileSync('./src/resources/json/responsive.json',
      JSON.stringify(data, null, 2)); // , null, 2
  }
}