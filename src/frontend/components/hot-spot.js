import Component from './component.js';

export default class HotSpot extends Component {
  enterDocument() {
    super.enterDocument();

    this.element.classList.add('visible');

    this.on('click', this.handleClick);
  }

  expand() {
    const hotspotDetail = document.body.querySelector('.hotspot-detail');
    hotspotDetail.classList.add('visible');

    const bg = hotspotDetail.querySelector('.hotspot-detail-background');
    const rect = this.element.getBoundingClientRect();
    bg.style.left = rect.left + 'px';
    bg.style.top = rect.top + 'px';

    const scale = Math.max(window.innerWidth, window.innerHeight) / 10 * 2;
    bg.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }

  handleClick() {
    this.expand();
  }


  setElement(el) {
    super.setElement(el);
    const [x, y] = el.dataset.position.split(',');
    el.style.left = x + '%';
    el.style.top = y + '%';
  }
}