import Marquee from "../components/marquee.js";

let marqueeCmps = [];
export default {
  decorate: (element) => {
    const text = 'magic';
    const speeds = [2, -2, 2];
    const html = [];
    for (let i = 0; i < 3; i++) {
      html.push(`<div class="marquee" data-speed="${speeds[i]}">`);
      html.push(`<div class="marquee__content">${text} ${text}</div>`);
      html.push('</div>');
    };
    element.querySelector('.decoration').innerHTML = html.join('');
    const marquees = element.querySelectorAll('.marquee');
    for (const marquee of marquees) {
      const marqueeCmp = new Marquee();
      marqueeCmp.decorate(marquee);
      marqueeCmp.setInView(true);
      marqueeCmps.push(marqueeCmp);
    }
  },
  undecorate: (element) => {
    for (const marqueeCmp of marqueeCmps) {
      marqueeCmp.exitDocument();
      marqueeCmp.dispose();
    }
    marqueeCmps = [];
    element.querySelector('.decoration').innerHTML = '';
  }
}