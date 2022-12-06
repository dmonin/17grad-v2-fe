export default () => document.cookie.split(';').map(function(c) {
    return c.trim().split('=').map(decodeURIComponent);
  }).reduce(function(a, b) {
    a[b[0]] = b[1];
    return a;
  }, {});

