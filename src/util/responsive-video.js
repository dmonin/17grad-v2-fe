const sizeOf = require('image-size');
const glob = require('glob');

module.exports = (videoPath) => {
  // poster
  const imgFiles = glob.sync(`${videoPath}-*.jpg`);
  const srcSet = [];
  let poster = '';
  for (const img of imgFiles) {
    const imgSize = sizeOf(img);
    srcSet.push({
      src: img.replace('.jpg', '.mp4'),
      imgSrc: img,
      width: imgSize.width,
      height: imgSize.height
    });
    poster = img;
  }

  if (srcSet.length == 0) {
    throw new Error('Video not found ' + videoPath);
  }

  return {
    poster,
    srcSet,
    sizes: srcSet.map(src => src.width).join(','),
    width: srcSet[0].width,
    height: srcSet[0].height
  };
}