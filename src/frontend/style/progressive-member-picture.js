import Component from '../components/component.js';

export default class ProgressiveMemberPicture extends Component {
  constructor() {
    super();

    /**
     * @type {Image}
     * @private
     */
    this.imageStart = null;

    /**
     * @type {Image}
     * @private
     */
    this.imageEnd = null;

    /**
     * @type {HTMLVideoElement}
     * @private
     */
    this.video = null;

    /**
     * @type {{width: number, height: number}}
     * @private
     */
    this.size = null;

    /**
     * @type {number}
     * @private
     */
    this.aspectRatio = 0;

    /**
     * @type {number}
     * @private
     */
    this.videoDuration = 0;

    /**
     * @type {Function}
     * @private
     */
    this.frameFn = this.frame.bind(this);

    /**
     * @type {boolean}
     * @private
     */
    this.reverse = false;

    /**
     * @type {number}
     * @private
     */
    this.currentTime = 0;
  }

  /**
   * @inheritdoc
   */
  enterDocument() {
    super.enterDocument();

    this.on('loadeddata', this.handleVideoDataLoaded, this.video);
    this.on('ended', this.handleVideoEnded, this.video);
    this.on('mouseenter', this.handleMouseEnter);
    this.on('mouseleave', this.handleMouseLeave);
  }

  /**
   * @private
   */
  frame() {
    const ctx = /** @type {CanvasRenderingContext2D} */ this.element.getContext('2d');
    ctx.drawImage(this.video, 0, 0, this.element.width, this.element.height);
    this.currentTime = this.video.currentTime;
    if (this.reverse && this.currentTime > 0) {
      this.currentTime -= 0.016;
      this.video.currentTime = this.currentTime;
    }

    this.video.requestVideoFrameCallback(this.frameFn);
  }

  /**
   * @private
   */
  handleMouseEnter() {
    this.reverse = false;
    this.video.play();
  }

  /**
   * @private
   */
  handleMouseLeave() {
    this.reverse = true;
    this.video.pause();
    this.currentTime -= 0.01;
    this.video.currentTime = this.currentTime;
    this.video.requestVideoFrameCallback(this.frameFn);
  }

  /**
   * @private
   */
  handleVideoDataLoaded() {
    this.videoDuration = this.video.duration;
    this.video.requestVideoFrameCallback(this.frameFn);
  }

  /**
   * @private
   */
  handleVideoEnded() {
    // this.renderImage(this.imageEnd);
  }

  /**
   *
   * @param {Image} image
   */
  renderImage(image) {
    const ctx = /** @type {CanvasRenderingContext2D} */ this.element.getContext('2d');
    ctx.drawImage(image, 0, 0, this.element.width, this.element.height);
  }

  setElement(element) {
    super.setElement(element);
    this.video = document.createElement('video');
    this.video.src = element.dataset.video;
    this.video.crossOrigin = true;
    this.video.playsInline = true;

    this.imageStart = new Image();
    this.imageStart.onload = this.updateSize.bind(this);
    this.imageStart.src = element.dataset.srcStart;

    this.imageEnd = new Image();
    this.imageEnd.src = element.dataset.srcEnd;
  }

  /**
   * @private
   */
  updateSize() {
    this.size = {
      width: this.imageStart.naturalWidth,
      height: this.imageStart.naturalHeight
    };

    this.aspectRatio = this.size.width / this.size.height;

    const width = this.element.parentNode.offsetWidth;
    this.element.width = width;
    this.element.height = width / this.aspectRatio;

    this.video.width = width;
    this.video.height = width / this.aspectRatio;
    this.renderImage(this.imageStart);
  }
}