const nanositemap = require('nanositemap');
const projectData = require('./../resources/json/projects.json');
const {format} = require('date-fns');

const pages = [
  {
    path: '/',
    codaRe: /^index/
  },
  {
    path: '/core',
    codaRe: /^core/
  },
  {
    path: '/work',
    codaRe: /^work/
  }
];

// Projects
const visible = projectData.visible;
for (const projectId of visible) {
  pages.push({
    path: '/work/' + projectId,
    codaRe: new RegExp(projectId)
  });
}

// Internationalize
const languages = ['de'];
for (const lang of languages) {
  const length = pages.length;
  for (let i = 0; i < length; i++) {
    const localized = {...pages[i]};
    localized.path = `/${lang}${localized.path}`.replace(/\/$/, '');
    localized.codaLang = lang.toUpperCase();
    pages.push(localized);
  }
}

function lastUpdate(page, codaRows) {
  if (!page.codaRe) {
    return null;
  }

  let maxDate = new Date(2020, 0, 1);
  for (const row of codaRows) {
    const key = row.values['Key'];

    if (key.match(page.codaRe)) {
      const updatedAt = new Date(row.updatedAt);
      if (updatedAt.getTime() > maxDate.getTime()) {
        maxDate = updatedAt;
      }
    }
  }

  return maxDate;
}

module.exports = function(codaRows) {
  const cfg = {};
  for (const page of pages) {
    cfg[page.path] = {};
    if (codaRows) {
      const lastmod = lastUpdate(page, codaRows);
      if (lastmod) {
        cfg[page.path].lastmod = format(lastmod, 'yyyy-MM-dd');
      }
    }
  }
  return nanositemap('https://17grad.com', cfg);
}