module.exports = (req) => {
  if (req.query.s) {
    switch (req.query.s) {
      case 'p':
        return 'progressive';
      case 'c':
        return 'corporate';
      case 'b':
        return 'brutal';
    }
  }
  return req.cookies.style || req.query.style || 'corporate';
}