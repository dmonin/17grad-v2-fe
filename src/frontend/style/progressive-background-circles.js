import Component from '../components/component.js';
import canvasService from '../services/canvas-service.js';
import { Post, Mesh, Plane, Program } from 'https://cdn.skypack.dev/ogl';
import CircleParticle from './circle-particle.js';
import animation from '../animation/animation.js';
import easing from '../animation/easing.js';
import eventService from '../services/event-service.js';

/**
 * @type {number}
 */
const CIRCLE_COUNT_PER_COLOR = 3;

/**
 * @type {number[]}
 */
const BLUE_CIRCLE_SIZES = [0.13, 0.11, 0.09];
const YELLOW_CIRCLE_SIZES = [0.22, 0.17, 0.2];

export class ProgressiveBackgroundCircles extends Component {
  constructor(props) {
    super(props);

    /**
     * @type {Function}
     * @private
     */
    this.frameFn = this.frame.bind(this);

    /**
     * @type {Function}
     * @private
     */
    this.handleScrollEndFn = this.handleScrollEnd.bind(this);

    /**
     * @type {number}
     * @private
     */
    this.lastScrollPosition = 0;

    /**
     * Last scroll delta.
     *
     * delta > 0 = scrolling down
     * delta < 0 = scrolling up
     * delta = 0 = no scrolling
     *
     * @type {number}
     * @private
     */
    this.scrollDelta = 0;

    /**
     * @type {Pass}
     * @private
     */
    this.pass = null;

    /**
     * @type {number}
     */
    this.time = 0;

    /**
     * @type {Function}
     * @private
     */
    this.frameFn = this.frame.bind(this);

    /**
     * @private
     */
    this.frameId = 0;

    /**
     * @type {CircleParticle[]}
     * @private
     */
    this.blueCircles = [];

    /**
     * @type {CircleParticle[]}
     * @private
     */
    this.yellowCircles = [];

    /**
     * @type {CircleParticles[]}
     * @private
     */
    this.allCircles = [];

    this.fadeAnimation = animation(1, 0, 3000, easing.inOut, {
      onFrame: (value) => {
        this.program.uniforms.uFadeOut.value = value[0];
      }
    });

    /**
     * @type {boolean}
     * @private
     */
    this.initialized = false;
  }

  /**
   * @private
   */
  checkBounds(circles) {
    for (let i = 0; i < circles.length; i++) {
      // Circle is in the visible range
      if (!circles[i].isOutOfBoundsX() && !circles[i].isOutOfBoundsY()) {
        continue;
      }

      // Scrolling behaviour
      if (this.scrollDelta != 0) {
        const y = this.scrollDelta > 0 ? 0 : 1;
        circles[i].setPosition(Math.random(), y);
        circles[i].offsetY = 0;
        circles[i].offsetX = 0;
        circles[i].reset();
        continue;
      }

      // In all other cases moving circle onto another circle
      const targetCircleIndex = Math.random() < 0.5
        ? (i + 1) % 3
        : (i + 2) % 3;

      const targetCircle = circles[targetCircleIndex];
      if (!targetCircle.isOutOfBoundsX() && !targetCircle.isOutOfBoundsY()) {
        circles[i].setToPosition(targetCircle);
        circles[i].reset();
      } else {
        circles[i].reset(true);
      }
    }
  }

  /** @inheritDoc */
  enterDocument() {
    super.enterDocument();
    this.on('resize', this.handleResize, window);
    this.on('scroll', this.handleScroll, eventService);
  }

  /** @inheritDoc */
  exitDocument() {
    super.exitDocument();

    cancelAnimationFrame(this.frameId);

    if (this.initialized) {
      canvasService.scene.removeChild(this.mesh);
      canvasService.nextFrame();
      this.mesh = null;
      this.program = null;
    }

    this.allCircles = [];
    this.yellowCircles = [];
    this.blueCircles = [];
  }

  /**
   * Sets uniform uFade out to canvasScrollOffset * 0.5
   */
  // fadeOut() {
  //   const fadeValue = Math.abs(this.canvasScrollOffset * 0.5);
  //   this.program.uniforms.uFadeOut.value = fadeValue;
  // }

  /**
   * @param {number?} time
   * @private
   */
  frame(time) {
    if (time) {
      this.frameId = 0;
    }
    for (const circle of this.allCircles) {
      circle.update();
    }

    const uniforms = this.program.uniforms;
    for (let i = 0; i < CIRCLE_COUNT_PER_COLOR; i++) {
      // Create array(3) with [x, y, size] for blue and yellow circles
      uniforms.uBlueCircles.value[i] = this.blueCircles[i].getColumn();
      uniforms.uYellowCircles.value[i] = this.yellowCircles[i].getColumn();
    }

    this.checkBounds(this.blueCircles);
    this.checkBounds(this.yellowCircles);

    this.program.uniforms.uTime.value += 0.001;
    this.pass.uniforms.uTime.value += 0.001;

    // if (this.program.uniforms.uFadeOut.value > 0) {
    //   this.program.uniforms.uFadeOut.value -= 0.01;
    // }
    if (this.scrollDelta != 0) {
      canvasService.frame();
    } else if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.frameFn);
      canvasService.nextFrame();

    }
  }

  /**
   * @private
   */
  handleResize() {
    this.updateMeshSize();
    canvasService.nextFrame();
  }

  /**
   * Handles browser scroll events
   * @param {number} scrollPosition
   * @param {*} scrollData
   * @private
   */
  handleScroll(scrollPosition, scrollData) {

    this.delay(this.handleScrollEndFn, 400, 'scroll-end');

    if (this.scrollDelta == 0) {
      this.fadeAnimation.stop();
      this.fadeAnimation.from = [this.program.uniforms.uFadeOut.value];
      this.fadeAnimation.to = [0.7];
      this.fadeAnimation.start();
    }

    const canvasHeight = canvasService.renderer.height;
    const position = scrollPosition;
    this.scrollDelta = (position - this.lastScrollPosition) / canvasHeight;

    for (const circle of this.allCircles) {
      if (scrollData.direction == 'x') {
        circle.offsetX += this.scrollDelta * 0.6;
      } else {
        circle.offsetY += this.scrollDelta * 0.6;
      }
    }

    // this.fadeOut();

    this.lastScrollPosition = position;

    this.frame();
  }

  /**
   * Handles scroll end event
   */
  handleScrollEnd() {
    this.scrollDelta = 0;
    if (this.scrollDelta == 0) {
      this.fadeAnimation.stop();
      this.fadeAnimation.from = [this.program.uniforms.uFadeOut.value];
      this.fadeAnimation.to = [0];
      this.fadeAnimation.start();
    }

    //this.canvasScrollOffset = 0;
    for (const circle of this.allCircles) {
      // circle.freeze(false);

      // If circle disappeared set to bounds
      // if (this.program.uniforms.uFadeOut.value > 0.6) {
      //   circle.setToBound(this.scrollDelta);
      // }
    }

    // this.program.uniforms.uFadeOut.value = 0.1;
    this.frameFn();
  }

  initialize() {
    this.initializeCircles();

    canvasService
      .shaders(
        'progressive-circles.frag',
        'progressive-circles.vert',
        'progressive-circles-post.frag'
      )
      .then(this.initializeProgram.bind(this));
  }

  /**
   * @private
   */
  initializeCircles() {
    for (let i = 0; i < CIRCLE_COUNT_PER_COLOR; i++) {
      this.blueCircles.push(new CircleParticle(BLUE_CIRCLE_SIZES[i]));
      this.yellowCircles.push(new CircleParticle(YELLOW_CIRCLE_SIZES[i]));
      this.allCircles.push(this.blueCircles[i]);
      this.allCircles.push(this.yellowCircles[i]);
    }
  }

  /**
   * Initializes rendering of images into canvas.
   * @param {*} shaders
   * @private
   */
  initializeProgram(shaders) {
    const renderer = canvasService.renderer;

    // Creating Shader Program
    this.program = new Program(renderer.gl, {
      vertex: shaders['progressive-circles.vert'],
      fragment: shaders['progressive-circles.frag'],
      uniforms: {
        // Matrix uniform: column contains x,y and circle size
        // Column = array at matrix[i]
        uBlueCircles: {
          value: [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
          ]
        },
        uYellowCircles: {
          value: [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
          ]
        },
        uFadeOut: { value: 0 },
        uTime: { value: 0 }
      },
      transparent: true
    });

    const post = new Post(renderer.gl);
    this.pass = post.addPass({
      fragment: shaders['progressive-circles-post.frag'],
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: 0 },
        uNoise: { value: 5 }
      },
      transparent: false
    });
    canvasService.post = post;

    // Adding Mesh to the scene
    const gl = renderer.gl;
    const geometry = new Plane(gl);
    this.mesh = new Mesh(gl, { geometry, program: this.program });
    this.mesh.setParent(canvasService.scene);

    this.updateMeshSize();

    this.initialized = true;

    this.frame();
  }

  /**
   * @inheritDoc
   */
  setElement(el) {
    super.setElement(el);
    this.delay(this.initialize.bind(this), 300);
  }

  /**
   * @private
   */
  updateMeshSize() {
    const scaleSize = Math.max(
      canvasService.viewportWidth,
      canvasService.viewportHeight
    );
    this.mesh.scale.x = scaleSize;
    this.mesh.scale.y = scaleSize;
  }
}
