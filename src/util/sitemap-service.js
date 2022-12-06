const fs = require('fs');

let sitemap = '';


module.exports = function() {
  if (!sitemap) {
    console.log('Reading local sitemap');
    sitemap = fs.readFileSync('./src/resources/xml/sitemap.xml');
  }

  return sitemap;
}