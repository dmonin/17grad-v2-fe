const sizeOf = require('image-size');
const path = require('path');
const fs = require('fs');

module.exports = (img) => {
  const imgPath = img;
  const dir = path.dirname(imgPath);
  const basename = path.basename(imgPath);
  const sizes = [256, 512, 968, 1280, 1680, 1920];
  const srcSet = [];
  for (size of sizes) {
    const imgSizePath = `${dir}/${size}/${basename}`;
    if (fs.existsSync(imgSizePath)) {
      const imgSize = sizeOf(imgSizePath);
      srcSet.push({
        src: imgSizePath,
        width: imgSize.width,
        height: imgSize.height
      });
    }
  }
  if (srcSet.length == 0) {
    throw new Error(`${imgPath} not found.`);
  }

  const data = {
    srcset: srcSet.map((item) => `${item.src} ${item.width}w`).join(','),
    width: srcSet[0].width,
    height: srcSet[0].height
  };
  return data;
}