const textService = require('./text-service');

/**
 *
 * @param {string} pageName
 * @param {string=} locale
 * @param {object=} replacements
 * @returns
 */
module.exports = (pageName, locale, replacements) => {
  const texts = textService.get(locale);
  const meta = {};
  const prefix = `meta.${pageName}`;
  meta.title = texts[`${prefix}.title`] || '';
  meta.description = texts[`${prefix}.description`] || '';

  if (replacements) {
    for (const k in meta) {
      for (const replaceKey in replacements) {
        meta[k] = meta[k].replace(`{${replaceKey}}`,
          replacements[replaceKey]);
      }
    }
  }
  return meta;
}