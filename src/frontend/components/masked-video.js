import Component from "./component.js"
import binarySearch from '../math/binary-search.js';

const factor = 1000000;
export default class MaskedVideo extends Component {
  constructor() {
    super();

    /**
     * @type {HTMLVideoElement}
     * @protected
     */
    this.video = null;
    /**
     * @type {string}
     * @private
     */
    this.videoSrc = null;

    /**
     * @type {CanvasRenderingContext2D}
     * @private
     */
    this.ctx = null;

    /**
     * @type {Function}
     * @private
     */
    this.frameFn = this.initializeFrame.bind(this);

    /**
     * @type {number}
     * @private
     */
    this.width = 0;

    /**
     * @type {number}
     * @private
     */
    this.height = 0;

    /**
     * @type {boolean}
     * @protected
     */
    this.isInitialized = false;

    /**
     * @type {HTMLCanvasElement}
     * @private
     */
    this.fullCanvas = document.createElement('canvas');

    /**
     * @type {CanvasRenderingContext2D}
     * @private
     */
    this.fullCtx = this.fullCanvas.getContext('2d');

    /**
     * @type {number}
     * @private
     */
    this.position = 0;

    /**
     * @type {number}
     * @protected
     */
    this.duration = 0;

    /**
     * @type {number}
     */
    this.frames = [];

    /**
     * @type {Map<number, number>}
     * @private
     */
    this.memory = new Map();

    /**
     * @type {boolean}
     * @private
     */
    this.isVisible = false;
  }

  /** @inheritDoc */
  enterDocument() {
    super.enterDocument();

    this.on('loadeddata', this.handleVideoDataLoaded, this.video);;
    this.on('ended', this.handleVideoEnded, this.video);
  }

  /**
   *
   * @param {number} position
   * @param {boolean=} force
   */
  getFrame(position) {
    const key = position;
    if (!this.memory.has(key)) {

    }

    return this.memory.get(key);
  }

  /**
   * @param {number} position
   * @private
   */
  saveFrame(position) {
    this.fullCtx.drawImage(this.video, 0, 0);
    const imageData = this.fullCtx.getImageData(0, 0, this.width, this.height * 2);
    const data = imageData.data;
    const halfHeight = imageData.height / 2;
    for (let y = 0; y < halfHeight; y++) {
      for (let x = 0; x < imageData.width; x++) {
        const red = y * this.width * 4 + x * 4;
        const alpha = red + 3;
        const maskRed = (y + halfHeight) * this.width * 4 + x * 4;
        data[alpha] = data[maskRed];
      }
    }
    this.memory.set(position, data);
    this.frames.push(position);
  }

  /**
   * @return {number}
   */
  getPosition() {
    return this.position;
  }

  /**
   * @private
   */
  initializeFrame() {
    const position = this.video.currentTime * factor;
    this.saveFrame(position);
    if (this.video.requestVideoFrameCallback) {
      this.video.requestVideoFrameCallback(this.frameFn);
    } else {
      requestAnimationFrame(this.frameFn);
    }
  }

  /**
   * @private
   */
  handleVideoDataLoaded() {
    if (!this.isInitialized) {
      this.width = this.video.videoWidth;;
      this.height = this.video.videoHeight / 2;
      this.element.width = this.width;
      this.element.height = this.height;
      // this.element.style.width = this.width + 'px';
      // this.element.style.height = this.height + 'px';

      this.fullCanvas.width = this.width;
      this.fullCanvas.height = this.height * 2;
      this.fullCanvas.style.width = this.width + 'px';
      this.fullCanvas.style.height = this.height * 2 + 'px';

      if (this.video.requestVideoFrameCallback) {
        this.video.requestVideoFrameCallback(this.frameFn);
      } else {
        requestAnimationFrame(this.frameFn);
      }
      this.video.currentTime = this.position;
      this.duration = this.video.duration * factor;

      // this.isInitialized = true;
      // this.initializeFrames();
      this.video.play();
    }
  }

  /**
   * @private
   */
  handleVideoEnded() {
    this.video.pause();
    this.isInitialized = true;
  }

  /** @inheritDoc */
  setElement(el) {
    super.setElement(el);

    this.ctx = el.getContext('2d');

    this.video = document.createElement('video');
    this.videoSrc = el.dataset.src;
    this.video.src = this.videoSrc;
    this.video.loop = false;
    this.video.autoplay = true;
    this.video.crossOrigin = true;
    this.video.playsInline = true;
    this.video.muted = true;

  }

  /**
   *
   * @param {number} position
   */
  setPosition(position) {
    if (!this.isInitialized && !this.isDisposed || this.position == position) {
      return;
    }

    if (!this.memory.has(position)) {
      // searching for closest position
      position = binarySearch([...this.frames], position);
    }

    if (this.memory.has(position)) {
      const data = this.memory.get(position);
      const imageData = this.ctx.createImageData(this.width, this.height);
      for (let i = 0; i < imageData.data.length; i++) {
        imageData.data[i] = data[i];
      }
      this.ctx.putImageData(imageData, 0, 0);
      this.position = position;

      if (!this.isVisible) {
        this.element.classList.add('--visible');
        this.isVisible = true;
      }
    }
  }
}