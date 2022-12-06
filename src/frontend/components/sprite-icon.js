export default (icon) => {
  const iconDom = document.createElement('div');
  iconDom.className = `icon-container`;

  const html = [
    `<svg class='svg-icon svg-icon-${icon}' xmlns='http://www.w3.org/2000/svg'>`,
      `<use xlink:href='/svg/icon-sprite.svg#${icon}' />`,
    `</svg>`].join('');
  iconDom.innerHTML = html;
  return iconDom;
};
