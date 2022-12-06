const locale = require("locale");
const supportedLocale = new locale.Locales(['en', 'de', 'es']);

module.exports = {
  urlLocale: (req) => {
    const localeMatch = req.path.match(/^\/(de|es)(\/|$)/i);
    let localeStr = 'en';
    // trying to match url
    return localeMatch ? localeMatch[1] : localeStr;
  },
  bestMatchingLocale: (req) => {
    const locales = new locale.Locales(req.headers["accept-language"], 'en');
    let localeStr = locales.best(supportedLocale).language;
    return localeStr;
  }
}
