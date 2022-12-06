import Component from './component.js';
import lerp from '../math/lerp.js';
import clamp from '../math/clamp.js';
import canvasService from '../services/canvas-service.js';
import { PlayElement } from '../play/play-element.js';
export default class PlayArea extends Component {
  constructor() {
    super();

    /**
     * @type {number}
     * @private
     */
    this.x = 0;

    /**
     * @type {number}
     * @private
     */
    this.width = 150;

    /**
     * @type {number}
     * @private
     */
    this.height = 100;

    /**
     * @type {number}
     * @private
     */
    this.screenWidth = 0;

    /**
     * @type {number}
     * @private
     */
    this.speed = 0;

    /**
     * @type {number}
     */
    this.cancelFrameId = 0;

    /**
     * @type {Function}
     * @private
     */
    this.frameFn = this.frame.bind(this);

    /**
     * @type {boolean}
     * @private
     */
    this.updateRequired = false;

    /**
     * @type {Array<PlayElement>}
     */
    this.elements = [];
  }

  async loadElements() {
    const response = await fetch('/play/elements');
    const playArea = await response.json();

    this.width = playArea['data']['width'];
    this.height = playArea['data']['height'];
    this.element.style.width = this.width + 'vw';
    this.element.style.height = this.height + 'vh';
    for (const elConfig of playArea['data']['elements']) {
      const element = new PlayElement(elConfig);
      element.decorate(document.getElementById(elConfig.id));
      this.addChild(element);
      this.elements.push(element);
      element.updatePosition(0);
    }

    // const scene = canvasService.scene;

    // for (const element of playArea['data']['elements']) {
    //   const mesh = new PlayElement(element, canvasService.renderer.gl);
    //   mesh.prepare().then(m => scene.addChild(m));
    // }

    // canvasService.nextFrame();
  }

  /**
   * @inheritdoc
   */
  enterDocument() {
    super.enterDocument();
    this.loadElements();
    this.updateScreenSize();
    this.on('mousemove', this.handleMouseMove, window);
  }

  /**
   * @private
   */
  handleMouseMove(e) {

    // Offset on screen, -0.5 till 0.5
    // const position = e.clientX / this.screenWidth - 0.5;

    // // Absolute value of offset
    // const absPos = Math.abs(position);

    // // Offset from which we start moving
    // // in our case between 0.2 - 0.5
    // const moveOffset = 0.1;
    // const moveDistance = 0.5 - moveOffset;
    // const multiplier = 1 / moveDistance;
    // // Transforming our move offset to scala 0 - 1 (from 0.2 - 0.5)
    // const relOffset = (absPos - moveOffset) * multiplier;

    // const maxSpeed = 0.01;
    // this.speed = absPos > moveOffset ? lerp(0, maxSpeed, relOffset) * Math.sign(position) * -1 : 0;

    this.nextFrame();
  }

  nextFrame() {
    // this.cancelFrameId = requestAnimationFrame(this.frameFn);
  }

  frame() {
    // const minX = 100 - this.width;
    // const maxX = 0;
    // const newX = clamp(this.x + this.speed, minX, maxX);

    // if (newX == this.x) {
    //   return;
    // }

    // this.x = newX;

    // this.element.style.transform = `translateX(${this.x}vw)`;
    // this.nextFrame();
  }

  updateScreenSize() {
    this.screenWidth = window.innerWidth;
  }

  setProgress(position) {
    // Converting to VW
    const vwPos = (position / this.screenWidth) * -100;
    for (const element of this.elements) {
      element.updatePosition(vwPos);
    }
  }
}