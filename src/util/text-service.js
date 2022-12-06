const fs = require('fs');

let texts = {};

async function getFromDb() {
  return texts;
}

function getLocally(locale = 'en') {
  return new Promise((resolve, reject) => {
    const text = fs.readFileSync(`./src/i18n/${locale}/texts.json`);
    resolve(JSON.parse(text));
    console.log('Resolved texts from local version.');
    return;
  });
}

const setText = (locale, t) => texts[locale] = t;

module.exports = {
  get: (locale) => {
    return texts[locale];
  },
  fetchCached: (locale) => {
    return new Promise(async (resolve, reject) => {
      if (!texts[locale]) {
        setText(locale, await getLocally(locale));
        if (process.env.DB_CONNECTION) {
          getFromDb(locale);
        } else {
          console.log('DB Configuration is not available.');
        }
      }

      resolve(texts[locale]);
    });
  }
}