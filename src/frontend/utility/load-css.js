export default (src, ordered) => {
  return new Promise((resolve, reject) => {
    const ref = document.getElementsByTagName( "link" )[0];
    const link = document.createElement( "link" );
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.href = src;
    link.media = 'all';
    link.onload = resolve;
    ref.parentNode.insertBefore(link, ref);

  });
}