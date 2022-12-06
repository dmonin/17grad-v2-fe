import { Vec2, Mesh, Program, Geometry, GPGPU } from 'https://unpkg.com/ogl';
import * as dat from 'https://unpkg.com/dat.gui@0.7.7/build/dat.gui.module.js';

import Component from '../components/component.js';
import canvasService from '../services/canvas-service.js';
import isTouchDevice from '../utility/is-touch-device.js';

export default class ProgressiveLogo extends Component {
  constructor() {
    super();

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
     * @type {string}
     * @private
     */
    this.vertexShader = 'logo-progressive.vert';

    /**
     * @type {string}
     * @private
     */
    this.fragmentShader = 'logo-progressive.frag';

    /**
     * @type {string}
     * @private
     */
    this.positionFragmentShader = 'logo-progressive-position.frag';

    /**
     * @type {string}
     * @private
     */
    this.velocityFragmentShader = 'logo-progressive-velocity.frag';

    /**
     * @type {string}
     * @private
     */
    this.textFragmentShader = 'logo-text.frag';

    /**
     * @type {GPGPU}
     * @private
     */
    this.position = null;

    /**
     * @type {GPGPU}
     * @private
     */
    this.velocity = null;

    /**
     * @type {Array}
     * @private
     */
    this.textures = null;

    /**
     * @type {Object}
     * @private
     */
    this.activeTexture = null;

    /**
     * @type {Object}
     * @private
     */
    this.textureResolution = { value: [0, 0] }

    /**
     * @type {Object}
     * @private
     */
    this.scale = { value: 1 };

    /**
     * @type {Object}
     * @private
     */
    this.time = { value: 0 };

    /**
     * @type {Object}
     * @private
     */
    this.mouse = { value: new Vec2() };

    /**
     * @type {Object}
     * @private
     */
    this.mouseDown = { value: false };

    /**
     * @type {Object}
     * @private
     */
    this.lastMousePos = { x: 0, y: 0 };

    /**
     * @type {boolean}
     * @private
     */
    this.fadeOut = false;

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
     * @type {Array}
     * @private
     */
    this.states = ['logo','orbit', 'text', 'blackhole'];

    /**
     * @type {number}
     * @private
     */
    this.stateIndex = 0;

    /**
     * @type {number}
     * @private
     */
    this.logoIndex = 0;

    /**
     * @type {boolean}
     * @private
     */
    this.initialized = false;

    /**
     * @type {Object}
     * @private
     */
    this.entropy = { value: 1 };

    /**
     * @type {Object}
     * @private
     */
    this.guiUniforms = {
      uScalarX: {
        // how the orbit is stretched on x axis
        value: 2
      },

      uScalarY: {
        // how the orbit is stretched on y axis
        value: 2
      },
    };

    /**
     * @type {number}
     * @private
     */
    this.lastTime = 0;
  }

  /** @inheritDoc */
  enterDocument() {
    super.enterDocument();

    this.initNavigationHover();

    if (isTouchDevice()) {
      this.on('touchmove', this.handleMouseMove, document.documentElement);
    } else {
      this.on('mousemove', this.handleMouseMove, document.documentElement);
      this.on('click', this.handleClick, document.documentElement)
    }
  }

  /**
   * @inheritDoc
   */
  setElement(element) {
    super.setElement(element);

    this.initialize();
  }

  /** @inheritDoc */
  exitDocument() {
    super.exitDocument();

    canvasService.removeSceneElements([this.mesh]);
    cancelAnimationFrame(this.frameId);

    if (this.initialized) {
      canvasService.nextFrame();

      this.program = null;
    }
  }

  /**
   * loads textures and calls initializeProgram after creating the textures
   *
   * @private
   */
  async initialize() {
    const promises = [
      canvasService.shaders(
        this.vertexShader,
        this.fragmentShader,
        this.positionFragmentShader,
        this.velocityFragmentShader,
        this.textFragmentShader
      )
    ];

    const imgSrcs = [
      '/webgl/progressive-logo/logo-attraction-map-transparent-red-blue.png',
      '/webgl/progressive-logo/typo-attraction-map-core.png',
      '/webgl/progressive-logo/typo-attraction-map-work.png',
      '/webgl/progressive-logo/typo-attraction-map-contact.png',
      '/webgl/progressive-logo/logo-attraction-map-velocity.jpg'
    ];

    for (const srcEl of imgSrcs) {
      promises.push(canvasService.createTexture(srcEl));
    }

    Promise.all(promises).then(this.initializeProgram.bind(this));
  }

  /**
   * Initializes shader programs
   * @param {*} params
   * @private
   */
  initializeProgram(params) {
    //shader and texture parameters from promises
    const [ shaders, attractionTexture, coreTex, workTex, contactTex, velTex ] = params;

    this.textures = [attractionTexture, coreTex, workTex, contactTex, velTex];
    this.activeTexture = this.textures[this.logoIndex];

    const correction = this.corrector(this.activeTexture);

    this.textureResolution.value = [correction[0] , correction[1]];
    this.textureResolution.value = [
      this.activeTexture.image.width,
      window.innerHeight
    ];

    const renderer = canvasService.renderer;
    const gl = renderer.gl;
    const particleCount = 65536;
    const [ initialPositionData, initialVelocityData, random ] = this.initializeRandomParticles(
      particleCount
    );

    // Initialise the GPGPU classes, creating the FBOs and corresponding texture coordinates
    this.position = new GPGPU(gl, { data: initialPositionData });
    this.velocity = new GPGPU(gl, { data: initialVelocityData });

    // Add the simulation shaders as passes to each GPGPU class:
    // position shader - keeps track of particle position according to velocity and keeps particles in bounds
    this.position.addPass({
      fragment: shaders[this.positionFragmentShader],
      uniforms: {
        uResolution: this.textureResolution,
        uTime: this.time,
        tVelocity: this.velocity.uniform,
        tAttraction: {value: this.textures[this.logoIndex]},
      },
    })

    // velocity shader - manages particle velocity based on attraction map
    this.velocity.addPass({
      fragment: shaders[this.velocityFragmentShader],
      uniforms: {
        uResolution: this.textureResolution,
        uTime: this.time,
        uMouse: this.mouse,
        uMouseVec: { value: [ 0, 0 ] },
        uOrbitSpeed: { value: 0.5 },
        uScalarX: this.guiUniforms.uScalarX, //radius on x axis
        uScalarY: this.guiUniforms.uScalarY, //radius on y axis
        uAttractionCenter: { value: [ 0.2, 0 ] },
        uAngle: { value: 120 },
        uSpeedUp: { value: 1 },
        uEntropy: this.entropy,
        uText: { value: false },
        tPosition: this.position.uniform,
        tAttraction: { value: this.textures[this.logoIndex] },
        tMask: { value: velTex }
      },
    })

    // 'point' geometry
    const geometry = new Geometry(gl, {
      random: { size: 4, data: random },
      coords: { size: 2, data: this.position.coords },
      position: { size: 2, data: this.position.coords },
      uv: { size: 2, data: this.position.coords },
    });

    // 'main' shader program running when triangle logo is shown
    this.program = new Program(renderer.gl, {
      vertex: shaders[this.vertexShader],
      fragment: shaders[this.fragmentShader],
      uniforms: {
        uScaling: this.scale,
        uTime: this.time,
        uMouse: this.mouse,
        uResolution: this.textureResolution,
        tPosition: this.position.uniform,
        tVelocity: this.velocity.uniform,
        uMouseDown: this.mouseDown,
        uMouse: this.mouse,
        uMouseVec: { value: [0, 0] },
        tAttraction: { value: this.textures[this.logoIndex] },
        tNextAttraction: { value: this.textures[this.logoIndex] },
        fadeInProgress: { value: 0 },
        fadeOutProgress: { value: 1 },
        uCorrector: { value: correction[2] },
        tMask: { value: velTex }
      },
    });

    this.mesh = new Mesh(gl, {
      geometry,
      program: this.program,
      mode: gl.POINTS
    });

    this.mesh.setParent(canvasService.scene);

    this.initialized = true;
    this.frame();
  }

  /**
   * creates 3 arrays each 4 component 'vector':
   * - position data:  random values from -1 to 1 (where particles start) for x and y, z is fade in progress, w is color indicator
   * - velocity data: zeros array (initial movement is set to 0)
   * - random data: random values
   *
   * @todo check if random array is ever used
   * @param {int} n number of particles
   * @returns
   */
  initializeRandomParticles(n) {
    // Create the initial data arrays for position and velocity. 4 values for RGBA channels in texture.
    const initialPositionData = new Float32Array(n * 4);
    const initialVelocityData = new Float32Array(n * 4);

    // Random to be used as regular static attribute
    const random = new Float32Array(n * 4);

    for (let i = 0; i < n; i++) {
      initialPositionData.set(
        [
          (Math.random() - 0.5) * 2.0,
          (Math.random() - 0.5) * 2.0,
          i / n, // Index for fade in
          Math.random(), // Particle is blue or yellow
        ],
        i * 4
      );
      initialVelocityData.set([0, 0, 0, 1], i * 4);
      random.set([
        Math.random(),
        Math.random(),
        Math.random(),
        Math.random()
      ], i * 4);
    }

    return [ initialPositionData, initialVelocityData, random ];
  }

  /**
   * Creates an impulse
   *
   * @todo maybe more parameters and fewer global variable calls?
   * @param {int} frequency frequency of impulses
   * @private
   */
  impulse(frequency) {
    // @todo: checks if the current time value is a multiple of the frequency -
    // rounding the result, to ensure it's always an integer
    if (Math.round(this.time.value * 100) % frequency == 0) {
      this.guiUniforms.uScalarX.value = .5;
      this.guiUniforms.uScalarY.value = .5;
    }
  }

  /**
   * Reduces particle movement
   * @param {float} step step by which the radii of the elliptic orbit is reduced
   */
  reduceMovement(step) {
    if (this.guiUniforms.uScalarX.value > 0) {
      this.guiUniforms.uScalarX.value -= step;
    }
    if (this.guiUniforms.uScalarY.value > 0) {
      this.guiUniforms.uScalarY.value -= step;
    }
  }

  /**
   * handles various animation stages
   *
   * @param {string} stage name of current stage
   */
  animationStage(stage) {
    switch (stage) {
      case "logo":
        this.entropy.value = 1;
        this.reduceMovement(0.25);

        if (this.guiUniforms.uScalarX.value < 0 || this.guiUniforms.uScalarY.value < 0) {
          this.guiUniforms.uScalarX.value = 0;
          this.guiUniforms.uScalarY.value = 0;
        }

        this.impulse(500)
        break;
      case "orbit":
        this.guiUniforms.uScalarX.value = 1.7;
        this.guiUniforms.uScalarY.value = 2.9;
        this.entropy.value = 1 + 5 * Math.random();
        break;
      case "text":
        this.reduceMovement(0.05);
        this.entropy.value = 1;
        break;
      //experimental attraction
      case 'blackhole':
        //allow negative values in order to get 'black hole effect'
        this.reduceMovement(0.05);
        this.entropy.value = 1;
        break;
    }
  }

  corrector(texture){
    const heightRatio =  window.innerHeight / texture.image.height;
    const newHeight = texture.image.height * heightRatio;
    const newWidth = texture.image.width * heightRatio;
    const remainingDelta = window.innerWidth - newWidth;
    const correctorValue = remainingDelta / (2 * newWidth);

    return [ newHeight, newWidth, correctorValue ];
  }

  /**
   * @private
   */
  frame(time) {
    const delta = (time - this.lastTime) / 1000;

    this.frameId = requestAnimationFrame(this.frameFn);
    this.time.value = time * delta;

    this.velocity.render();
    this.position.render();
    this.animationStage(this.states[this.stateIndex])
    this.program.uniforms.fadeInProgress.value = Math.pow(this.time.value / 4, 6);

    if (this.program.uniforms.fadeInProgress.value > 1){
      this.program.uniforms.fadeInProgress.value = 1;
    }

    if (this.fadeOut && this.mesh.program.uniforms.fadeOutProgress.value > 0) {
      this.mesh.program.uniforms.fadeOutProgress.value -= 0.01;
    }
    else if(!this.fadeOut && this.mesh.program.uniforms.fadeOutProgress.value < 1) {
      this.mesh.program.uniforms.fadeOutProgress.value += 0.01;
    }

    canvasService.nextFrame();

    this.lastTime = time;
  }

  /**
   * tracks mouse movement and updates mouse uniform
   *
   * @param {MouseEvent} e
   * @private
   */
  handleMouseMove(e) {
    if (e.changedTouches && e.changedTouches.length) {
      e.x = e.changedTouches[0].pageX;
      e.y = e.changedTouches[0].pageY;
    }

    if (e.x === undefined) {
      e.x = e.pageX;
      e.y = e.pageY;
    }

    // @todo: add a check / delay so it won't refresh every second?
    this.mouse.value.set(
      (e.x / canvasService.renderer.width) * 2 - 1,
      (1 - e.y / canvasService.renderer.height) * 2 - 1
    );

    const mouseVec = [
      e.x - this.lastMousePos.x,
      e.y - this.lastMousePos.y
    ];

    this.lastMousePos.x = e.x
    this.lastMousePos.y = e.y
    this.velocity.passes[0].uniforms.uMouseVec.value = mouseVec;
    this.program.uniforms.value = mouseVec;
  }

  /**
   * Currently manually changes animation
   */
  handleClick(e) {
    this.stateIndex += 1;
    this.stateIndex %= this.states.length;
  }

  /**
   * updates textures for passes
   * @param {Texture} newTexture new attraction texture for position and velocity passes
   */
  updateTextures(newTexture) {
    this.position.passes[0].uniforms.tAttraction.value = newTexture;
    this.velocity.passes[0].uniforms.tAttraction.value = newTexture;
  }

  /**
   * Handles transition from logo to text program and vice versa
   *
   * @param {*} targetProgram
   * @param {*} speedUp
   * @param {*} attractionCenter
   */
  transition(targetProgram, speedUp, attractionCenter){
    this.activeTexture = this.textures[this.logoIndex];
    const correction = this.corrector(this.activeTexture);

    this.textureResolution.value = [correction[0] , correction[1]];
    this.program.uniforms.uCorrector.value = correction[2];
    this.program.uniforms.uResolution = this.textureResolution;
    this.stateIndex = 1;
    this.velocity.passes[0].uniforms.uSpeedUp.value = 10;

    this.animationStage(this.states[this.stateIndex]);

    this.velocity.passes[0].uniforms.uOrbitSpeed.value = speedUp;
    this.velocity.passes[0].uniforms.uAttractionCenter.value =  attractionCenter;

    this.updateTextures(this.textures[this.logoIndex])

    this.stateIndex = 2;
    this.velocity.passes[0].uniforms.uSpeedUp.value = 1;

    this.animationStage(this.states[this.stateIndex]);

    this.fadeOut = !this.fadeOut;
  }

  /**
   * @private
   */
  initNavigationHover() {
    const navEls = document.documentElement.querySelectorAll('.index__nav li');

    navEls.forEach(navEl => {
      navEl.addEventListener('mouseover', () => {
        this.logoIndex = parseInt(navEl.dataset.num);
        this.program.uniforms.tNextAttraction.value = this.textures[this.logoIndex];
        this.program.uniforms.tAttraction.value = this.textures[this.logoIndex];
        this.velocity.passes[0].uniforms.uText.value = true;

        this.transition(this.program, 100, [ -1, -1 ]);
      });

      navEl.addEventListener('mouseout', () => {
        this.logoIndex = 0;
        this.stateIndex = 0;
        this.velocity.passes[0].uniforms.uText.value = false;
        this.program.uniforms.tAttraction.value = this.textures[this.logoIndex];

        this.transition(this.program, 1, [ 0.2, 0 ]);
      });
    });

    if (this.initialized) {
      this.activeTexture = this.textures[this.logoIndex];
    }
  }
}