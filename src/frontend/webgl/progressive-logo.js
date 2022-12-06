import httpHeaders from '../utility/http-headers.js';
import { Canvas } from './canvas.js';

export default class ProgressiveLogo extends Canvas {

  /** @inheritDoc */
  constructor() {
    super();

    /**
     * @type {string}
     * @private
     */
    this.shaderBasePath = '/shader/';

    /**
     * @type {string}
     * @private
     */
    this.dataBasePath = '/json/';

    /**
     * @type {number}
     * @private
     */
    this.oldTimestamp = 0.0;

    /**
     * @type {number}
     * @private
     */
    this.totalTime = 0;

    /**
     * @type {number}
     * @private
     */
    this.readIndex = 0;

    /**
     * @type {number}
     * @private
     */
    this.writeIndex = 1;

    /**
     * @type {Object}
     * @private
     */
    this.logoData = {
      speed: 0.5,
      numParticles: 20000,
      mode: 0.0,
      boost: 0.1,
      boostThreshold: 0.1,
      circleSize: 0.1,
      originalWidth: 1200,
      originalHeight: 857
    };

    /**
     * @type {Object}
     * @private
     */
    this.palette = {
      innerColor: [0, 0, 255],
      outerColor: [255, 255, 0],
    };

    /**
     * Left triangle position
     * @type {Object}
     * @private
     */
    this.leftTriangle = {
      A: [this.toScreenVal(0), this.toScreenVal(0)],
      B: [this.toScreenVal(0.35), this.toScreenVal(0.92)],
      C: [this.toScreenVal(0.50), this.toScreenVal(0.22)]
    };

    /**
     * Right triangle position
     * @type {Object}
     * @private
     */
    this.rightTriangle = {
      A: [this.toScreenVal(0.5), this.toScreenVal(0.77)],
      B: [this.toScreenVal(0.64), this.toScreenVal(0.07)],
      C: [this.toScreenVal(1), this.toScreenVal(1)]
    };

    /**
     * Particles positions
     * @type {Object}
     * @private
     */
    this.positions = null;

    /**
     * @type {Array<WebGLBuffer>}
     * @private
     */
    this.buffers = [];

    /**
     * @type {Array<WebGLVertexArrayObject>}
     * @private
     */
    this.vaos = [];

    /**
     * @type {Object}
     * @private
     */
    this.updateUniformLocations = {};

    /**
     * @type {Object}
     * @private
     */
    this.updateAttribLocations = {};

    /**
     * @type {Object}
     * @private
     */
    this.renderUniformutLocations = {};

    /**
     * @type {Object}
     * @private
     */
    this.renderAttributLocations = {};

    /**
     * @type {Function}
     * @private
     */
    this.updateSizeFn = this.updateSize.bind(this);
  }

  /** @inheritDoc */
  enterDocument() {
    // Canvas resolution
    this.updateSize();

    super.enterDocument();

    this.initNavigationHover();
    this.createprograms();

    this.on('resize', () => {
      this.throttle(this.updateSizeFn, 100)
    });
  }

  /**
   * @protected
   */
  setWebglVersion() {
    this.gl = this.element.getContext('webgl2');
  }

  /**
   * @private
   */
  initNavigationHover() {
    const navEls = document.documentElement.querySelectorAll('.index__nav li');
    navEls.forEach(navEl => {
      navEl.addEventListener('mouseover', () => {
        this.logoData.mode = parseInt(navEl.dataset.num);
      });
      navEl.addEventListener('mouseout', () => {
        this.logoData.mode = 0;
      });
    });
  }

  /**
   * @private
   */
  createprograms() {
    const fetchConfig = {
      headers: httpHeaders(),
    };

    Promise.all([
      fetch(this.shaderBasePath + 'logo-update.vert', fetchConfig),
      fetch(this.shaderBasePath + 'logo-render.vert', fetchConfig),
      fetch(this.shaderBasePath + 'logo-pass.frag', fetchConfig),
      fetch(this.shaderBasePath + 'logo.frag', fetchConfig)
    ]).then(async ([updateVertexResponse, renderVertextResponse, updateFragmentResponse, renderFragmentResponse]) => {

      const updateVertex = await updateVertexResponse.json();
      const renderVertex = await renderVertextResponse.json();
      const updateFragment = await updateFragmentResponse.json();
      const renderFragment = await renderFragmentResponse.json();

      this.renderProgram = this.createProgram(renderVertex.shader, renderFragment.shader);
      this.updateProgram = this.createProgram(updateVertex.shader, updateFragment.shader, [
        'v_Position',
        'v_Velocity',
        'v_Acceleration',
        'v_Gravity',
        'v_Friction',

        'v_LogoPos',
        'v_CorePos',
        'v_WorkPos',
        'v_PlayPos',
      ]);

      this.initUniformLocations();
      this.initPositionData();
      this.render();
    });
  }

  /**
   * @private
   */
  initPositionData() {
    fetch(this.dataBasePath + 'logo-progressive.json').then(async (response) => {
      const data = await response.json();
      if (data) {
        this.positions = data;
        this.initBuffers();
      }
    });
  }

  initBuffers() {
    if (this.positions.core.length == 0 ||
      this.positions.work.length == 0 ||
      this.positions.play.length == 0) {
      return;
    }
    const gl = this.gl;

    this.updateAttribLocations = {
      i_Position: {
        location: gl.getAttribLocation(this.updateProgram, 'i_Position'),
        numComponents: 2,
        type: gl.FLOAT
      },
      i_Velocity: {
        location: gl.getAttribLocation(this.updateProgram, 'i_Velocity'),
        numComponents: 2,
        type: gl.FLOAT
      },
      i_Acceleration: {
        location: gl.getAttribLocation(this.updateProgram, 'i_Acceleration'),
        numComponents: 2,
        type: gl.FLOAT
      },
      i_Gravity: {
        location: gl.getAttribLocation(this.updateProgram, 'i_Gravity'),
        numComponents: 2,
        type: gl.FLOAT
      },
      i_Friction: {
        location: gl.getAttribLocation(this.updateProgram, 'i_Friction'),
        numComponents: 1,
        type: gl.FLOAT
      },
      i_LogoPos: {
        location: gl.getAttribLocation(this.updateProgram, 'i_LogoPos'),
        numComponents: 4,
        type: gl.FLOAT
      },
      i_CorePos: {
        location: gl.getAttribLocation(this.updateProgram, 'i_CorePos'),
        numComponents: 2,
        type: gl.FLOAT
      },
      i_WorkPos: {
        location: gl.getAttribLocation(this.updateProgram, 'i_WorkPos'),
        numComponents: 2,
        type: gl.FLOAT
      },
      i_PlayPos: {
        location: gl.getAttribLocation(this.updateProgram, 'i_PlayPos'),
        numComponents: 2,
        type: gl.FLOAT
      },
    };

    this.renderAttributLocations = {
      i_Position: {
        location: gl.getAttribLocation(this.renderProgram, 'i_Position'),
        numComponents: 2,
        type: gl.FLOAT
      }
    };

    this.buffers = [
      gl.createBuffer(),
      gl.createBuffer(),
    ];

    this.vaos = [
      gl.createVertexArray(),
      gl.createVertexArray(),
      gl.createVertexArray(),
      gl.createVertexArray()
    ];

    const vaoDesc = [
      {
        vao: this.vaos[0],
        buffers: [{
          bufferObject: this.buffers[0],
          attribs: this.updateAttribLocations
        }]
      },
      {
        vao: this.vaos[1],
        buffers: [{
          bufferObject: this.buffers[1],
          attribs: this.updateAttribLocations
        }]
      },
      {
        vao: this.vaos[2],
        buffers: [{
          bufferObject: this.buffers[0],
          attribs: this.renderAttributLocations
        }],
      },
      {
        vao: this.vaos[3],
        buffers: [{
          bufferObject: this.buffers[1],
          attribs: this.renderAttributLocations
        }],
      },
    ];

    const initialData = new Float32Array(this.initialParticleData(this.logoData.numParticles));
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[0]);
    gl.bufferData(gl.ARRAY_BUFFER, initialData, gl.STREAM_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[1]);
    gl.bufferData(gl.ARRAY_BUFFER, initialData, gl.STREAM_DRAW);

    let numComponents = 0;
    for (let attrib in this.updateAttribLocations) {
      numComponents += this.updateAttribLocations[attrib].numComponents;
    }

    const stride = this.vaos.length * numComponents;
    for (let i = 0; i < vaoDesc.length; i++) {
      this.setupBufferVAO(vaoDesc[i].buffers, vaoDesc[i].vao, stride);
    }
  }

  /**
   * @param {number} numParticles
   * @private
   */
  initialParticleData(numParticles) {
    const data = [];
    for (let i = 0; i < numParticles; ++i) {
      // position
      data.push(Math.random());
      data.push(Math.random());

      // velocity
      data.push((Math.random() - 0.5) * 0.01);
      data.push((Math.random() - 0.5) * 0.01);

      // acceleration
      data.push(0.0);
      data.push(0.0);

      // gravity
      data.push(0.0);
      data.push(0.0);

      // friction
      data.push(Math.random() * 0.01 + 0.95);

      // Possible positions
      data.push(Math.random());
      data.push(Math.random());
      data.push(Math.random());
      data.push(Math.random());

      const corePos = this.positions.core[Math.floor(Math.random() * this.positions.core.length)];
      data.push(corePos[0]);
      data.push(corePos[1]);

      const workPos = this.positions.work[Math.floor(Math.random() * this.positions.work.length)];
      data.push(workPos[0]);
      data.push(workPos[1]);

      const playPos = this.positions.play[Math.floor(Math.random() * this.positions.play.length)];
      data.push(playPos[0]);
      data.push(playPos[1]);
    }
    return data;
  }

  /**
   * @private
   */
  initUniformLocations() {
    const gl = this.gl;

    this.updateUniformLocations = {
      u_TimeDelta: gl.getUniformLocation(this.updateProgram, 'u_TimeDelta'),
      u_Speed: gl.getUniformLocation(this.updateProgram, 'u_Speed'),
      u_Boost: gl.getUniformLocation(this.updateProgram, 'u_Boost'),
      u_BoostThreshold: gl.getUniformLocation(this.updateProgram, 'u_BoostThreshold'),
      u_CircleSize: gl.getUniformLocation(this.updateProgram, 'u_CircleSize'),
      u_MousePos: gl.getUniformLocation(this.updateProgram, 'u_MousePos'),
      u_Mode: gl.getUniformLocation(this.updateProgram, 'u_Mode'),

      u_LeftTriangleA: gl.getUniformLocation(this.updateProgram, 'u_LeftTriangleA'),
      u_LeftTriangleB: gl.getUniformLocation(this.updateProgram, 'u_LeftTriangleB'),
      u_LeftTriangleC: gl.getUniformLocation(this.updateProgram, 'u_LeftTriangleC'),
      u_RightTriangleA: gl.getUniformLocation(this.updateProgram, 'u_RightTriangleA'),
      u_RightTriangleB: gl.getUniformLocation(this.updateProgram, 'u_RightTriangleB'),
      u_RightTriangleC: gl.getUniformLocation(this.updateProgram, 'u_RightTriangleC'),
    };

    this.renderUniformLocations = {
      u_Resolution: gl.getUniformLocation(this.renderProgram, 'u_Resolution'),
      u_MousePos: gl.getUniformLocation(this.renderProgram, 'u_MousePos'),
      u_InnerColor: gl.getUniformLocation(this.renderProgram, 'u_InnerColor'),
      u_OuterColor: gl.getUniformLocation(this.renderProgram, 'u_OuterColor'),
    };
  }

  /**
   * @param {number} timestamp
   * @private
   */
  setUpdateProgramUniforms(timestamp) {
    const gl = this.gl;

    let timeDelta = 0.0;
    if (this.oldTimestamp != 0) {
      timeDelta = timestamp - this.oldTimestamp;
      if (timeDelta > 500.0) {
        // Reset when window was inactive
        timeDelta = 0.0;
      }
    }
    this.oldTimestamp = timestamp;
    this.totalTime += timeDelta;

    gl.useProgram(this.updateProgram);

    gl.uniform1f(this.updateUniformLocations.u_TimeDelta, timeDelta / 1000.0);
    gl.uniform1f(this.updateUniformLocations.u_Mode, this.logoData.mode);
    gl.uniform1f(this.updateUniformLocations.u_Speed, this.logoData.speed);
    gl.uniform1f(this.updateUniformLocations.u_Boost, this.logoData.boost);
    gl.uniform1f(this.updateUniformLocations.u_BoostThreshold, this.logoData.boostThreshold);
    gl.uniform1f(this.updateUniformLocations.u_CircleSize, this.logoData.circleSize);
    gl.uniform2f(this.updateUniformLocations.u_MousePos,
      this.toScreenVal(this.mousePos.x),
      this.toScreenVal(this.mousePos.y)
    );

    // Keep triangles in aspect ratio
    const aspectFit = this.calculateAspectRatioFit(
      this.logoData.originalWidth, this.logoData.originalHeight,
      this.canvasBoundingBox.width, this.canvasBoundingBox.height
    );
    const scaleY = aspectFit.height / this.canvasBoundingBox.height;
    const scaleX = aspectFit.width / this.canvasBoundingBox.width;

    // Left Triangle
    gl.uniform2f(this.updateUniformLocations.u_LeftTriangleA,
      this.leftTriangle.A[0] * scaleX,
      this.leftTriangle.A[1] * scaleY
    );
    gl.uniform2f(this.updateUniformLocations.u_LeftTriangleB,
      this.leftTriangle.B[0] * scaleX,
      this.leftTriangle.B[1] * scaleY
    );
    gl.uniform2f(this.updateUniformLocations.u_LeftTriangleC,
      this.leftTriangle.C[0] * scaleX,
      this.leftTriangle.C[1] * scaleY
    );

    // Right Triangle
    gl.uniform2f(this.updateUniformLocations.u_RightTriangleA,
      this.rightTriangle.A[0] * scaleX,
      this.rightTriangle.A[1] * scaleY
    );
    gl.uniform2f(this.updateUniformLocations.u_RightTriangleB,
      this.rightTriangle.B[0] * scaleX,
      this.rightTriangle.B[1] * scaleY
    );
    gl.uniform2f(this.updateUniformLocations.u_RightTriangleC,
      this.rightTriangle.C[0] * scaleX,
      this.rightTriangle.C[1] * scaleY
    );
  }

  /**
   * @private
   */
  setRenderProgramUniforms() {
    const gl = this.gl;

    gl.uniform2f(this.renderUniformLocations.u_Resolution,
      this.element.width,
      this.element.height
    );

    gl.uniform3f(this.renderUniformLocations.u_InnerColor,
      this.palette.innerColor[0] / 255,
      this.palette.innerColor[1] / 255,
      this.palette.innerColor[2] / 255
    );
    gl.uniform3f(this.renderUniformLocations.u_OuterColor,
      this.palette.outerColor[0] / 255,
      this.palette.outerColor[1] / 255,
      this.palette.outerColor[2] / 255
    );
  }

  /** @inheritDoc */
  render(timestamp) {
    super.render(timestamp);

    if (this.isDisposed) {
      return;
    }

    if (this.buffers.length == 0) {
      return;
    }

    this.setUpdateProgramUniforms(timestamp);

    // Update program vao bindings
    const gl = this.gl;
    gl.bindVertexArray(this.vaos[this.readIndex]);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this.buffers[this.writeIndex]);

    gl.enable(gl.RASTERIZER_DISCARD); // Because we are not rendering anything

    // Transform Feedback
    gl.beginTransformFeedback(gl.POINTS);
    gl.drawArrays(gl.POINTS, 0, this.logoData.numParticles);
    gl.endTransformFeedback();
    gl.disable(gl.RASTERIZER_DISCARD);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null); // Unbinding transform feedback

    // Actual drawing
    gl.bindVertexArray(this.vaos[this.readIndex + 2]);
    gl.useProgram(this.renderProgram);

    this.setRenderProgramUniforms();

    gl.drawArrays(gl.POINTS, 0, this.logoData.numParticles);

    // Swap buffers
    const tmp = this.readIndex;
    this.readIndex = this.writeIndex;
    this.writeIndex = tmp;
  }

  /**
   * @private
   */
  updateSize() {
    const width = Math.max(1024, window.innerWidth);;
    const height =  width == 1024 ? width * 0.56 : window.innerHeight;
    this.element.width = width;
    this.element.height = height;
  }
}