export default (src, ordered) => {
  return new Promise((resolve, reject) => {
    const ref = document.getElementsByTagName( "script" )[0];
    const script = document.createElement( "script" );
    script.src = src;
    script.async = !ordered;
    script.onload = resolve;
    ref.parentNode.insertBefore(script, ref);
  });
}