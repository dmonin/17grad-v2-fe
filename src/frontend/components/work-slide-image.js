import Component from "./component.js";
import canvasService from '../services/canvas-service.js';
import { Vec2, Mesh, Plane, Program, Post } from 'https://cdn.skypack.dev/ogl';
import cachedRect from '../utility/cached-rect.js';
import eventService from '../services/event-service.js';
import pageStyleService from "../services/page-style-service.js";

export default class WorkSlideImage extends Component {
  constructor() {
    super();

    /**
     * @type {cachedRect}
     * @private
     */
    this.cachedRect = null;

    /**
     * @type {Program}
     * @private
     */
    this.program = null;

    /**
     * @type {Pas}
     * @private
     */
    this.pass = null;

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
     * @type {boolean}
     * @private
     */
    this.initialized = false;

    /**
     * @type {string}
     * @private
     */
    this.fragmentShader = '';

    /**
     * @type {string}
     * @private
     */
    this.vertexShader = '';

    /**
     * @type {string}
     * @private
     */
    this.postFragment = '';

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
     * @private
     */
    this.xbionicTexture = null;

    /**
     * @private
     */
    this.daeskTexture = null;

    /**
     * @private
     */
    this.compensaidTexture = null;

    this.corporate = false;

    this.oldPosition = 0;
  }

  /** @inheritDoc */
  enterDocument() {
    super.enterDocument();

    this.on('scroll', this.handleScroll, eventService);
    this.on('mousemove', this.handleMouseMove, document.documentElement);
    this.on('scroll-offset', this.handleScrollOffset, eventService);
  }

  /** @inheritDoc */
  exitDocument() {
    super.exitDocument();
    canvasService.removePass(this.pass)
    cancelAnimationFrame(this.frameId);

    if (this.initialized) {
      canvasService.scene.removeChild(this.mesh);
      canvasService.nextFrame();
      this.mesh = null;
      this.program = null;
    }
  }

  /**
   *
   * @param {MouseEvent} e
   * @private
   */
  handleMouseMove(e) {
    const [x,y] = [(e.clientX )/(canvasService.renderer.width ),
      1. - e.clientY/ canvasService.renderer.height]
    if (this.program) {
      this.program.uniforms.uMousePosition.value[0] = x;
      this.program.uniforms.uMousePosition.value[1] = y;
      this.pass.uniforms.uMousePosition.value[0] = x;
      this.pass.uniforms.uMousePosition.value[1] = y;
      canvasService.nextFrame();
    }
  }

  /**
   *
   * @param {number} position
   * @private
   */
  handleScroll(position) {
    if (this.initialized) {
      const bounds = this.cachedRect.rect(position, 'x');
      this.updateBounds(bounds);
      if (this.oldPosition - position < 0) {
        this.pass.uniforms.uDirection.value = -1;
      }
      else {
        this.pass.uniforms.uDirection.value = 1;
      }
      if (pageStyleService.style == 'brutal'){
        if (position > - window.innerWidth) {
          this.program.uniforms.tMap2.value = this.xbionicTexture;
          this.pass.uniforms.displacement.value = this.xbionicTexture;
        }
        else if (position > - window.innerWidth * 1.85) {
          this.program.uniforms.tMap2.value = this.compensaidTexture;
          this.pass.uniforms.displacement.value = this.compensaidTexture;
        }
        else {
          this.program.uniforms.tMap2.value = this.daeskTexture;
          this.pass.uniforms.displacement.value = this.daeskTexture;
        }
      }
      this.oldPosition = position;
      canvasService.nextFrame();
    }
  }

  /**
   *
   * @param {number} offset
   * @private
   */
  handleScrollOffset(offset) {
    if (this.initialized) {
      this.program.uniforms.uProgress.value = Math.min(1, offset * 4);
      this.pass.uniforms.uProgress.value = Math.min(1, offset * 4);

      canvasService.nextFrame();
    }
  }

  /**
   * @private
   */
  initialize() {
    // Image Element
    const image = this.element.querySelector('.work-list__slide__image > img');
    this.image = image;
    this.cachedRect = cachedRect(image, 3000);

    const promises = [];
    switch (pageStyleService.style) {
      case 'progressive':
        promises.push(
          canvasService.shaders('works-progressive.vert', 'works-progressive.frag',
            'works-all-styles-post.frag')
        );
        this.fragmentShader = 'works-progressive.frag';
        this.vertexShader = 'works-progressive.vert';
        this.postFragment = 'works-all-styles-post.frag';
        break;
      case 'brutal':
        promises.push(
          canvasService.shaders('works-brutal.vert', 'works-brutal.frag',
            'works-all-styles-post.frag')
        );
        this.fragmentShader = 'works-brutal.frag';
        this.vertexShader = 'works-brutal.vert';
        this.postFragment = 'works-all-styles-post.frag';
        break;
      case 'corporate':
        promises.push(
          canvasService.shaders('works-corporate.vert', 'works-corporate.frag',
          'works-all-styles-post.frag')
        );
        this.fragmentShader = 'works-corporate.frag';
        this.vertexShader = 'works-corporate.vert';
        this.postFragment = 'works-all-styles-post.frag';
        this.corporate = true;
        break;
    }

    promises.push(canvasService.createTexture(image));
    const displacementSrc = this.element.dataset.displacement || '/webgl/works-progressive/displacement.png';
    promises.push(canvasService.createTexture(displacementSrc));

    if(pageStyleService.style == 'brutal'){
      const textureSrc = '/webgl/works-progressive/project-xbionic-01-displacementmap-inverse.png';
      textureSrc;
      promises.push(canvasService.createTexture(displacementSrc));

      promises.push(canvasService.createTexture(textureSrc))
    }
    Promise.all(promises).then(this.initializeProgram.bind(this));
  }

  initializeBrutalTextures() {
    const xbionicSrc = '/webgl/works-progressive/project-xbionic-01-displacementmap-inverse.png';
    const compensaidSrc = '/webgl/works-progressive/project-lih-01-displacementmap-inverse.png';
    const daeskSrc = '/webgl/works-progressive/project-daesk-01-displacementmap-inverse.png';
    const promises = []
    promises.push(canvasService.createTexture(xbionicSrc))
    promises.push(canvasService.createTexture(compensaidSrc))
    promises.push(canvasService.createTexture(daeskSrc))
    Promise.all(promises).then(this.setBrutalTextures.bind(this))
  }

  setBrutalTextures(params){
    this.xbionicTexture = params[0]
    this.compensaidTexture = params[1]
    this.daeskTexture = params[2]
  }

  /**
   * Initializes rendering of images into canvas.
   * @param {*} params
   */
  initializeProgram(params) {
    const [shaders, texture, displacementTexture,texture2] = params;
    const renderer = canvasService.renderer;
    if (pageStyleService.style == 'brutal'){
      this.initializeBrutalTextures();
    }
    // Creating Shader Program
    this.program = new Program(renderer.gl, {
      vertex: shaders[this.vertexShader],
      fragment: shaders[this.fragmentShader],
      uniforms: {
        tMap: { value: texture },
        tMap2: {value: texture2},
        tDisplacement: {value: displacementTexture},
        uProgress: {value: 0.0},
        uMousePosition: { value: new Vec2(0, 0)},

      },
      transparent: true
    });

    // Adding Mesh to the scene
    const gl = renderer.gl;
    const geometry = new Plane(gl);
    this.mesh = new Mesh(gl, {geometry, program: this.program});
    this.mesh.setParent(canvasService.scene);

    const bounds = this.image.getBoundingClientRect();
    this.updateBounds(bounds);

    //Adding post processing
    const post = new Post(gl);
    this.pass = post.addPass({
      fragment: shaders[this.postFragment],
      uniforms:{
        uTime: {value: 0},
        uMousePosition: {value: [0.0,0.0]},
        uProgress: {value: 0.},
        displacement: {value: displacementTexture},
        corporate: {value: this.corporate},
        uDirection: {value: 1.}
    },
    })
    canvasService.post = post;

    this.element.classList.add('ready');
    this.initialized = true;
    canvasService.nextFrame();
    this.frame();
  }

  /**
   * @private
   */
  frame() {
    this.pass.uniforms.uTime.value += 0.01;
    this.frameId = requestAnimationFrame(this.frameFn);
    canvasService.nextFrame();
  }

  /**
   *
   * @param {Object} bounds
   */
  updateBounds(bounds) {
    if (!this.mesh) {
      return;
    }

    const mesh = this.mesh;

    const size = canvasService.convertDimension(bounds.width, bounds.height);
    mesh.scale.x = size[0];
    mesh.scale.y = size[1];

    const position = canvasService.convertDimension(bounds.left, bounds.top);

    const viewportWidth = canvasService.viewportWidth;
    const viewportHeight = canvasService.viewportHeight;

    mesh.position.x = (mesh.scale.x - viewportWidth) / 2 + position[0];
    mesh.position.y = (viewportHeight - mesh.scale.y) / 2 - position[1];
  }

  /**
   * @inheritDoc
   */
  setElement(element) {
    super.setElement(element);

    this.delay(this.initialize.bind(this), 1000);
  }
}