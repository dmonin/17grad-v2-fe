module.exports = (req, res, templateName, viewData, jsonData = {}) => {
  const {title} = viewData;
  if (req.xhr) {
    viewData = {...viewData, ...res.locals};
    res.app.render(templateName + '-content', viewData, (err, html) => {
      if (err) {
        res.json({
          error: err.message
        });
      } else {
        res.json({
          style: res.locals.style,
          html,
          title,
          ...jsonData
        });
      }
    });
  } else {
    res.render(templateName, viewData);
  }
}