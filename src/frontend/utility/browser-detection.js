export default () => {
  if (navigator.userAgent.indexOf("Safari") != -1 &&
    navigator.userAgent.indexOf("Chrome") == -1) {
    document.documentElement.classList.add('safari');
  }
}