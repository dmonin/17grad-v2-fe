import Vec from '../math/vec.js';
import Component from './component.js';
import Draggable from './draggable.js';
import pageStyleService from '../services/page-style-service.js';
import eventService from '../services/event-service.js';
import animation from '../animation/animation.js';
import easing from '../animation/easing.js';
import shapePath from '../style/style-shape-path.js';
import progressiveMagicDecorator from '../style/progressive-magic-decorator.js';
import brutalMagicDecorator from '../style/brutal-magic-decorator.js';
import corporateMagicDecorator from '../style/corporate-magic-decorator.js';
import simpleSvgpathAnim from '../animation/simple-svgpath-anim.js';

const giphyVideos = [
  'progressive01.mp4',
  'brutal01.mp4',
  'brutal02.mp4',
  'brutal03.mp4',
  'brutal04.mp4',
  'brutal05.mp4',
  'corporate01.mp4',
  'corporate02.mp4',
  'corporate03.mp4',
  'corporate04.mp4',
  'corporate05.mp4',
  'corporate06.mp4',
  'corporate07.mp4',
  'corporate08.mp4',
  'corporate09.mp4',
  'progressive02.mp4',
  'progressive03.mp4',
  'progressive04.mp4',
  'progressive05.mp4',
  'progressive06.mp4',
  'progressive07.mp4',
  'progressive08.mp4',
  'progressive09.mp4',
  'progressive10.mp4'
];
export default class StyleSwitchMenu extends Component {
  constructor(props) {
    super(props);

    /**
     * Slider element
     *
     * @type {Element}
     * @private
     */
    this.slider = null;

    /**
     * Track element
     *
     * @type {Element}
     * @private
     */
    this.track = null;

    /**
     * List of all SVG path elements
     *
     * @type {NodeList<SVGPathElement>}
     * @private
     */
    this.svgPaths = null;

    /**
     * Current Track X position
     *
     * @type {number}
     * @private
     */
    this.x = 0;

    /**
     * Animation Target for the Track
     * @type {number}
     * @private
     */
    this.targetX = 0;

    /**
     * Draggable instance for the track
     * @type {Draggable}
     * @private
     */
    this.draggable = null;

    /**
     * Width of the slider
     * @type {number}
     * @private
     */
    this.width = 0;

    /**
     * Velocity of the track
     *
     * @type {Vec}
     * @private
     */
    this.trackVelocity = new Vec(0);

    /**
     * For faster access
     * @type {Object}
     * @private
     */
    this.animFn = this.animate.bind(this);

    /**
     * List of all styles
     *
     * @type {Array<string>}
     * @private
     */
    this.styles = [
      'corporate',
      'progressive',
      'brutal'
    ];

    /**
     * Current Style
     *
     * @type {string}
     */
    this.style = '';

    /**
     * @type {*}
     * @private
     */
    this.svgAnim = null;

    /**
     * Current SVG Path
     * @type {string}
     */
    this.currentShape = null;

    /**
     * All available shape transitions
     * @type {Array<{from: Array<number>, to: Array<number>, path: Function}>}
     * @private
     */
    this.shapeTransitions = [];

    /**
     * Current shape transition
     * @type {{from: Array<number>, to: Array<number>, path: Function}}
     * @private
     */
     this.shapeTransition = null;

    /**
     * Callback when Magic is finished
     *
     * @type {Function}
     * @private
     */
    this.resolveMagic = null;

    /**
     * Current magic duration
     * @type {number}
     * @private
     */
    this.resolveTime = 0;

    /**
     * Function which decorates magic element.
     *
     * @type {{decorate: (element:Element) => void, undecorate: (element:Element) => void}}
     * @private
     */
    this.magicDecorator = null;
  }

  /**
   * @private
   */
  animate() {
    const friction = 1/10;
    const inertion = 14;

    this.trackVelocity.x = this.trackVelocity.x * (1 - 1 / inertion);

    this.x += this.trackVelocity.x * friction;

    const xDiff = this.targetX - this.x;
    this.x += xDiff / 10;
    if (Math.abs(xDiff) < 1) {
      this.x = this.targetX;
    }

    this.updatePosition();
    this.nextFrame();
  }

  /**
   * Animates track to target index
   *
   * @param {number} targetIndex
   * @param {boolean=} hardSwitch
   * @private
   */
  animateToTargetIndex(targetIndex, hardSwitch) {
    this.targetX = this.getPosByStyleIndex(targetIndex);
    if (hardSwitch) {
      this.x = this.targetX;
      this.updatePosition();
    } else {
      this.nextFrame();
    }

    const newStyle = this.styles[targetIndex];
    this.setStyle(newStyle, hardSwitch);
  }

  /**
   * @inheritDoc
   * @override
   */
  enterDocument() {
    super.enterDocument();

    this.on('click', this.handleClose, '.close')

    const attachListeners = (selector) => {
      const clickAreas = this.element.querySelectorAll(selector);
      for (let i = 0; i < clickAreas.length; i++) {
        this.on('click', () => {
          this.animateToTargetIndex(i, true);
        }, clickAreas[i]);
      }
    };

    this.on('ended', this.handleMagicVideoEnded, '.magic video');

    // Quick Style Switch by Click
    attachListeners('.select-button');

    // Texts
    attachListeners('.style-switcher__item .text:first-child');


    // A little nicer for the memory to define closure first
    const handleResize = this.updateSize.bind(this);
    this.on('resize', () => {
      this.delay(handleResize, 300, 'resize');
    }, window);

    this.setStyle(pageStyleService.style);
    this.updateSize();

    // Defining shape animation
    this.svgAnim = animation([], [], 1000, easing.easeOut, {
      onFrame: this.handleShapeFrame.bind(this),
      onEnd: this.handleShapeTransformEnd.bind(this)
    });

    // Defining shape transitions
    this.shapeTransitions.push(
      simpleSvgpathAnim(
        shapePath['corporate'], shapePath['progressive']
      )
    );

    this.shapeTransitions.push(
      simpleSvgpathAnim(
        shapePath['progressive'], shapePath['brutal']
      )
    );
  }

  /**
   * Gets closes anchor index for track element based on x position
   * @return {number}
   * @private
   */
  getClosestIndex(x) {
    const progress = x / this.width;
    if (progress < 0.25) {
      return 0;
    } else if (progress < 0.75) {
      return 1;
    } else {
      return 2;
    }
  }

  /**
   * Gets X position for track based on style index
   *
   * @param {number} index
   * @private
   * @return {number}
   */
  getPosByStyleIndex(index) {
    return index / 2 * this.width;
  }

  /**
   * Event handler for closing
   *
   * @private
   */
  handleClose() {
    this.props.onClose && this.props.onClose();
  }

  /**
   * Event handler for key down
   * @param {KeyboardEvent} e
   * @private
   */
  handleKeyDown(e) {
    if (e.key == 'Escape') {
      this.props.onClose && this.props.onClose();
    }
  }

  /**
   * Event handler when magic video has ended
   * @param {Event} e
   * @private
   */
  handleMagicVideoEnded(e) {
    const now = +new Date();
    if (now - this.resolveTime < 3000) {
      this.childElement('.magic video').play();
      return;
    }

    if (this.resolveMagic) {
      setTimeout(this.resolveMagic, 100);
      setTimeout(() => {
        if (this.magicDecorator) {
          this.magicDecorator.undecorate(this.element);
        }

        this.childElement('.magic').classList.remove('--visible')
      }, 1500);
    }
  }

  /**
   * Handles shape animation frame
   *
   * @param {Array<number>} v
   * @private
   */
  handleShapeFrame(v) {
    const shape = this.shapeTransition.path(v);
    this.setShape(shape);
  }

  /**
   * Handles end frame of the shape transition
   * @private
   */
  handleShapeTransformEnd() {
    this.setShape(shapePath[this.style]);
  }

  /**
   * Handles track drag release
   * @param {Vec} velocity
   * @param {Vec} targetMove
   * @private
   */
  handleRelease(velocity, targetMove) {
    this.trackVelocity = velocity.clone();
    velocity.x = 0;

    const targetIndex = this.getClosestIndex(this.x + targetMove.x);
    this.animateToTargetIndex(targetIndex);
  }

  /**
   * Handles movement of track
   * @param {number} n
   * @private
   */
  handleTrackMove(delta) {
    this.moveBy(delta.x);
  }

  /**
   *
   * @param {number} x
   * @private
   */
  moveBy(x) {
    this.x += x;
    this.x = Math.max(0, Math.min(this.x, this.width));

    const progress = this.x / this.width;
    const transitionIndex = progress <= 0.5 ? 0 : 1;
    const transition = this.shapeTransitions[transitionIndex];

    let val = progress;
    if (val > 0.5) {
      val -= 0.5;
    }
    val *= 2;

    this.setShape(transition.position(val));

    this.updatePosition();
  }

  /**
   * @private
   */
  nextFrame() {
    if (!this.draggable.isDragging &&
      (Math.abs(this.trackVelocity.x) > 1 || this.targetX != this.x)) {
      requestAnimationFrame(this.animFn);
    }
  }

  /** @inheritDoc */
  setElement(element) {
    super.setElement(element);

    this.slider = element.querySelector('.style-switcher__slider');
    this.track = element.querySelector('.style-switcher__slider__track');
    this.svgPaths = element.querySelectorAll('svg.style-shape path');

    this.draggable = new Draggable({
      onStart: () => {
        this.draggable.element.classList.add('--dragging');
      },
      onEnd: () => {
        this.draggable.element.classList.remove('--dragging');
      },
      onRelease: this.handleRelease.bind(this),
      onMove: this.handleTrackMove.bind(this)
    });
    this.draggable.setElement(this.track);
    this.draggable.setActive(true);
    this.addChild(this.draggable);
  }

  /**
   * @param {string} style
   * @private
   */
  setMagicSrc(style) {
    const found = giphyVideos.filter(s => s.match(style));
    const index = Math.floor(Math.random() * found.length);
    const src = found[index];
    const metaStatic = document.documentElement.querySelector('meta[name=staticPath]');
    const staticDir = metaStatic.getAttribute('content');
    const fullSrc = `${staticDir}video/style-switch/${src}`;
    this.childElement('.magic video').src = fullSrc;
  }

  /**
   *
   * @param {string} shape
   * @private
   */
  setShape(shape) {
    this.currentShape = shape;
    for (let i = 0; i < this.svgPaths.length; i++) {
      this.svgPaths[i].setAttribute('d', shape);
    }
  }

  /**
   *
   * @param {boolean} isVisible
   */
  setVisible(isVisible) {
    if (isVisible) {
      this.element.classList.add('--visible');
      const currentStyle = pageStyleService.style;
      const index = this.styles.indexOf(currentStyle);
      const targetX = this.getPosByStyleIndex(index);
      this.x = targetX;
      this.updatePosition();
      eventService.dispatch('menu-open');
      this.on('keydown', this.handleKeyDown, document.documentElement);
      document.body.classList.add('style-switcher-expanded');
      gtag('event', 'screen_view', {
        'app_name': '17grad',
        'screen_name' : 'Style Switch'
      });
    } else {
      eventService.dispatch('menu-close');
      this.element.classList.remove('--visible');
      this.off('keydown', this.handleKeyDown, document.documentElement);
      document.body.classList.remove('style-switcher-expanded');
    }
  }

  /**
   * @param {string} style
   * @param {boolean=} hardSwitch
   * @private
   */
  setStyle(style, hardSwitch) {
    if (style != this.style) {
      this.element.classList.remove(`--${this.style}`);
      this.element.classList.add(`--${style}`);
      this.updateContent(style);
      this.setMagicSrc(style);
    }

    if (!shapePath[style]) {
      console.error(shapePath, style);
    }

    const currentShape = this.currentShape;
    const newShape = shapePath[style];
    if (hardSwitch || !this.svgAnim) {
      this.setShape(shapePath[style]);
    } else {
      this.svgAnim.stop();
      this.shapeTransition = simpleSvgpathAnim(currentShape, newShape);
      this.svgAnim.from = this.shapeTransition.fromValues;
      this.svgAnim.to = this.shapeTransition.toValues;
      this.svgAnim.start();
    }

    this.style = style;
  }

  /**
   * Updates layer content according to selected style
   * @param {string} style
   * @private
   */
  updateContent(style) {
    const header = this.childElement('h3');
    header.innerHTML = style;
    header.setAttribute('data-label', style);
    this.childElement('.style-switcher__info__description p').innerHTML = this.props.texts[style];

    const mainHeader = this.childElement('.style-switcher__header');
    mainHeader.parentNode.style.height = mainHeader.offsetHeight + 'px';
    // first time
    if (mainHeader.className == 'style-switcher__header') {
      mainHeader.className = `style-switcher__header --${style}`;
    } else {
      const copy = mainHeader.cloneNode(true);
      copy.className = `style-switcher__header --${style}`;
      copy.classList.add('--in');
      mainHeader.parentNode.appendChild(copy);
      setTimeout(() => {
        copy.classList.remove('--in');
        mainHeader.classList.add('--out');
      }, 10);

      setTimeout(() => {
        mainHeader.parentNode.removeChild(mainHeader);
      }, 550);
    }
  }

  /**
   * Shows magic overlay
   */
  showMagic() {
    return new Promise(resolve => {
      this.resolveTime = +new Date();
      const magic = this.childElement('.magic');
      magic.classList.add('--visible');
      if (this.style == 'progressive') {
        this.magicDecorator = progressiveMagicDecorator;
      } else if (this.style == 'brutal') {
        this.magicDecorator = brutalMagicDecorator;
      } else if (this.style == 'corporate') {
        this.magicDecorator = corporateMagicDecorator;
      }

      if (this.magicDecorator) {
        this.magicDecorator.decorate(magic);
      }

      const video = this.childElement('.magic video');
      video.play();

      this.resolveMagic = resolve;
    });
  }

  /**
   * @private
   */
  updatePosition() {
    this.track.style.transform = `translate(${this.x}px, 0)`;
  }

  /**
   * @private
   */
  updateSize() {
    this.width = this.slider.offsetWidth;
  }
}