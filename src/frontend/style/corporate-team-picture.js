import { Texture, Plane, Program, Mesh, Vec4, Renderer, Transform, Camera } from 'https://cdn.skypack.dev/ogl';
import animation from '../animation/animation.js';
import easing from '../animation/easing.js';
import Component from '../components/component.js';
import canvasService from '../services/canvas-service.js';
import cachedRect from '../utility/cached-rect.js';


export class CorporateTeamPicture extends Component {
  constructor() {
    super();

    /**
     * First element is normal state
     * Second element is hover state
     *
     * @type {Texture[]}
     * @private
     */
    this.textures = [];

    /**
     * @type {Program}
     * @private
     */
    this.program = null;

    /**
     * @type {Mesh}
     * @private
     */
    this.mesh = null;

    /**
     * @type {Image}
     * @private
     */
    this.image = null;

    /**
     * @type {cachedRect}
     * @private
     */
    this.cachedRect = null;

    /**
     * @type {boolean}
     * @private
     */
    this.initialized = false;

    /**
     * @type {Renderer}
     * @private
     */
    this.renderer = null;


    /**
     * @type {number}
     */
     this.viewportWidth = 0;

     /**
      * @type {number}
      */
     this.viewportHeight = 0;

    /**
     * @type {Transform}
     */
    this.scene = new Transform();

    /**
     * @type {Function}
     * @private
     */
     this.frameFn = this.frame.bind(this);

    /**
     * @type {Object}
     * @private
     */
    this.hoverAnimation = animation([0], [1], 500, easing.inAndOut, {
      onFrame: this.handleHoverFrame.bind(this)
    });
  }

  /**
   * @inheritDoc
   */
  enterDocument() {
    super.enterDocument();

    this.on('mouseenter', this.handleMouseEnter);
    this.on('mouseleave', this.handleMouseLeave);
    this.on('resize', this.handleResize, window);
  }

  /**
   * @inheritDoc
   */
  exitDocument() {
    super.exitDocument();

    if (this.mesh) {
      this.scene.removeChild(this.mesh);
      this.mesh = null;
      this.program = null;
    }
  }

  /**
   * Handles image hover.
   *
   * @param {number} val
   * @private
   */
  handleHoverFrame(val) {
    this.program.uniforms.uDisplacementFactor.value = val;
    this.nextFrame();
  }

  /**
   * Handles mouse enter event and starts mouse over animation.
   * @private
   */
  handleMouseEnter() {
    this.hoverAnimation.from = [0];
    this.hoverAnimation.to = [1];
    this.hoverAnimation.stop();
    this.hoverAnimation.start();
  }

  /**
   * Handles mouse leave event and starts back to normal animation.
   * @private
   */
  handleMouseLeave() {
    this.hoverAnimation.from = [1];
    this.hoverAnimation.to = [0];
    this.hoverAnimation.stop();
    this.hoverAnimation.start();
  }

  /**
   * Handles window resize event and updates positions
   *
   * @private
   */
  handleResize() {
    if (!this.initialized) {
      return;
    }

    const rect = this.cachedRect.rect(window.scrollY, 'y', 300);
    this.updateSize(rect);
    this.updateCanvasSize();
    this.nextFrame();
  }

  /**
   * @private
   */
  frame() {
    this.updateRequested = false;
    const { scene, camera } = this;
    this.renderer.render({ scene, camera });
  }

  /**
   * Schedules next frame rendering
   */
  nextFrame() {
      if (this.updateRequested) {
        return;
      }

      this.updateRequested = true;
      requestAnimationFrame(this.frameFn);
    }

   /**
   * Converts 2d vector screen dimensions into 3D space dimensions.
   *
   * @param {number} x
   * @param {number} y
   */
    convertDimension(x, y) {
      return [
        this.viewportWidth * x / this.renderer.width,
        this.viewportHeight * y / this.renderer.height
      ];
    }

    /**
     * initializes scene
     */
    initializeScene() {
      const canvas = document.createElement('canvas');
      canvas.className = 'resp-canvas';
      this.element.appendChild(canvas);

      this.renderer = new Renderer({alpha: true, canvas});
      const camera = new Camera(this.renderer.gl);
      camera.fov = 45;
      camera.position.z = 5;
      this.camera = camera;

      this.updateCanvasSize();
  }

  /**
   * Initializes rendering of images into canvas.
   * @param {*} params
   */
  initializeProgram(params) {
    const [shaders, textureFrom, textureTo, displacementTexture] = params;


    this.program = new Program(this.renderer.gl, {
      vertex: shaders['corporate-member-hover.vert'],
      fragment: shaders['corporate-member-hover.frag'],
      uniforms: {
        tMapFrom: { value: textureFrom },
        tMapTo: { value: textureTo },
        tDisplace: {value: displacementTexture},
        uDisplacementFactor: {value: 0.0}
      },
      transparent: true
    });

    const gl = this.renderer.gl;
    const geometry = new Plane(gl);
    this.mesh = new Mesh(gl, {geometry, program: this.program});
    this.mesh.setParent(this.scene);

    const bounds = this.image.getBoundingClientRect();
    this.updateSize(bounds);
    this.initialized = true;
    this.element.classList.add('ready');
  }

  /**
   * @param {Object} bounds
   * @private
   */
  updateSize(bounds) {
    const scale = this.convertDimension(bounds.width, bounds.height);
    this.mesh.scale.x = scale[0];
    this.mesh.scale.y = scale[1];
    this.nextFrame();
  }

  /**
   * @inheritDoc
   */
  setElement(el) {
    super.setElement(el);
    this.cachedRect = cachedRect(el.querySelector('img'), 3000);
    const images = this.element.querySelectorAll('img');
    this.image = images[0];

    this.initializeScene();

    const promises = [];
    promises.push(
      canvasService.shaders('corporate-member-hover.frag', 'corporate-member-hover.vert')
    );
    for (const img of images) {
      promises.push(canvasService.createTexture(img, this.renderer));
    }

    const displacementSrc = el.dataset.displacement || '/webgl/corporate-core-people/displacement-default.jpg';
    promises.push(canvasService.createTexture(displacementSrc, this.renderer));
    Promise.all(promises).then(this.initializeProgram.bind(this));
  }

  /**
   * Updates canvas size
   * @private
   */
  updateCanvasSize() {
    const elementRect = this.image.getBoundingClientRect();
    this.renderer.setSize(elementRect.width, elementRect.height);
    this.camera.perspective({
      aspect: this.renderer.width / this.renderer.height,
    });

    const fov = this.camera.fov * (Math.PI / 180);
    this.viewportHeight = 2 * Math.tan(fov / 2) * this.camera.position.z
    this.viewportWidth = this.viewportHeight * this.camera.aspect;
  }

}
