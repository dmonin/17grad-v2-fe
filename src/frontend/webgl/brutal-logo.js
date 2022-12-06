import { Canvas } from './canvas.js';
import { default as OBJ } from './utils/webgl-obj-loader.js';
import httpHeaders from '../utility/http-headers.js';
import loadJs from '../utility/load-js.js';
import lerp from '../math/lerp.js';

export default class BrutalLogo extends Canvas {

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
    this.textureUrl = '/obj/cubemap.png';

    /**
     * @type {any}
     * @private
     */
    this.meshes = null;

    /**
     * @type {any}
     * @private
     */
    this.models = {};

    /**
     * @type {any}
     * @private
     */
    this.camera = {};

    /**
     * @type {WebGLProgram}
     * @private
     */
    this.program = null;

    /**
     * @type {mat4}
     * @private
     */
    this.pMatrix = null;

    /**
     * @type {mat4}
     * @private
     */
    this.mvMatrix = null;

    /**
     * @type {Object}
     * @private
     */
    this.mousePosTarget = {
      x: 0,
      y: 0
    };

    /**
     * @type {number}
     * @private
     */
    this.transitionValue = 0;

    /**
     * @type {number}
     * @private
     */
    this.transitionTarget = 0;

    /**
     * @type {any}
     * @private
     */
    this.logo = {
      position: [-0.1, 0, 0],
      scale: [1.0, 1.0, 1.0]
    };

    /**
     */
    this.glMatrix = new Promise((resolve, reject) => {
      const script = '/third-party/gl-matrix.js';
      loadJs(script).then(resolve);
    });
  }

  /** @inheritDoc */
  enterDocument() {
    super.enterDocument();

    this.handleResize();

    const navEls = document.documentElement.querySelectorAll('.index__nav li');
    navEls.forEach(navEl => {
      navEl.addEventListener('mouseover', () => {
        switch (navEl.dataset.num) {
          case '01':
            this.transitionTarget = 1;
            break;
          case '02':
            this.transitionTarget = 3;
            break;
          case '03':
            this.transitionTarget = -2;
            break;
        }
      });
      navEl.addEventListener('mouseout', () => {
        this.transitionTarget = 0;
      });
    });

    // Init member that need gl-matrix when loaded
    this.glMatrix.then(result => {

      this.pMatrix = mat4.create();
      this.mvMatrix = mat4.create();

      // Camera
      this.camera.position = [0, 0, 7.0];
      this.camera.inversePosition = vec3.create();
      this.camera.heading = 0;
      this.camera.pitch = 0;

      // Meshes
      OBJ.downloadMeshes(
        { 'logo': '/obj/17grad-triangle-diamonds-adv-02-glass.obj' },
        this.init.bind(this)
      );
    });
  }

  /** @inheritDoc */
  handleResize() {
    this.element.width = this.element.parentElement.offsetWidth;
    this.element.height = this.element.parentElement.offsetHeight;

    if (this.gl) {
      this.gl.viewportWidth = this.element.width;
      this.gl.viewportHeight = this.element.height;
    }

    // this.logo.scale = [0.7, 0.7, 0.7];

    super.handleResize();
  }

  /**
   * @param {MouseEvent} e
   * @protected
   */
  handlePointerMove(e) {
    this.mousePosTarget.x = lerp(0, 1, e.pageX / window.innerWidth);
    this.mousePosTarget.y = lerp(0, 1, e.pageY / window.innerHeight);
  }

  /**
   * @param {any} meshes
   * @private
   */
  init(meshes) {
    this.meshes = meshes;
    const gl = this.gl;

    this.initShaders();
    this.initBuffers();
    this.initTexture();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    this.render();
  }

  /**
   * @private
   */
  initShaders() {
    const gl = this.gl;

    const fetchConfig = {
      headers: httpHeaders(),
    };

    Promise.all([
      fetch(this.shaderBasePath + 'logo-brutal.vert', fetchConfig),
      fetch(this.shaderBasePath + 'logo-brutal.frag', fetchConfig)
    ]).then(async ([vertexResponse, fragmentResponse]) => {

      const vertex = await vertexResponse.json();
      const fragment = await fragmentResponse.json();
      this.program = this.createProgram(vertex.shader, fragment.shader);

      gl.useProgram(this.program);

      this.program.vertexPositionAttribute = gl.getAttribLocation(this.program, 'aVertexPosition');
      gl.enableVertexAttribArray(this.program.vertexPositionAttribute);

      this.program.vertexNormalAttribute = gl.getAttribLocation(this.program, 'aVertexNormal');
      gl.enableVertexAttribArray(this.program.vertexNormalAttribute);

      this.program.textureCoordAttribute = gl.getAttribLocation(this.program, 'aTextureCoord');
      gl.enableVertexAttribArray(this.program.textureCoordAttribute);

      this.program.vertexTransitionAttribute = gl.getAttribLocation(this.program, 'aVertexTransition');
      gl.enableVertexAttribArray(this.program.vertexTransitionAttribute);

      this.program.pMatrixUniform = gl.getUniformLocation(this.program, 'uPMatrix');
      this.program.mvMatrixUniform = gl.getUniformLocation(this.program, 'uMVMatrix');
      this.program.nMatrixUniform = gl.getUniformLocation(this.program, 'uNMatrix');
      this.program.samplerUniform = gl.getUniformLocation(this.program, 'uSampler');
      this.program.materialShininessUniform = gl.getUniformLocation(this.program, 'uMaterialShininess');
      this.program.useTexturesUniform = gl.getUniformLocation(this.program, 'uUseTextures');
      this.program.time = gl.getUniformLocation(this.program, 'iTime');
      this.program.transition = gl.getUniformLocation(this.program, 'iTransition');
      this.program.mousePos = gl.getUniformLocation(this.program, 'uMousePos');
    });
  }

  /**
   * @private
   */
  initBuffers() {
    const gl = this.gl;

    for (const mesh in this.meshes) {
      OBJ.initMeshBuffers(this.gl, this.meshes[mesh]);
      this.models[mesh] = {};
      this.models[mesh].mesh = this.meshes[mesh];

      // Vertex transition buffer for hover animations
      const data = [];
      const vertexBuffer = this.models[mesh].mesh.vertexBuffer;
      for (let i = 0; i < vertexBuffer.numItems; i++) {
        data.push(Math.random());
      }

      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
      buffer.itemSize = 1;
      buffer.numItems = data.length;
      this.models[mesh].mesh.vertexTransitionBuffer = buffer;
    }
  }

  /**
   * @private
   */
  initTexture() {
    const gl = this.gl;
    const object = this.models.logo;

    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    var faces = [
      [this.textureUrl, gl.TEXTURE_CUBE_MAP_POSITIVE_X],
      [this.textureUrl, gl.TEXTURE_CUBE_MAP_NEGATIVE_X],
      [this.textureUrl, gl.TEXTURE_CUBE_MAP_POSITIVE_Y],
      [this.textureUrl, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y],
      [this.textureUrl, gl.TEXTURE_CUBE_MAP_POSITIVE_Z],
      [this.textureUrl, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]
    ];

    for (var i = 0; i < faces.length; i++) {
        var face = faces[i][1];
        var image = new Image();
        image.onload = function(texture, face, image) {
            return function() {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
                gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            }
        } (texture, face, image);
        image.src = faces[i][0];
    }

    object.texture = texture;

    // object.texture.image = new Image();
    // object.texture.image.crossOrigin = "anonymous";
    // object.texture.image.onload = () => {

    // }
    // object.texture.image.src = this.textureUrl;
  }

  /**
   * @private
   */
  degToRad(degrees) {
    return degrees * Math.PI / 180;
  }

  /**
   * @private
   */
  setMatrixUniforms() {
    const gl = this.gl;
    gl.uniformMatrix4fv(this.program.pMatrixUniform, false, this.pMatrix);
    gl.uniformMatrix4fv(this.program.mvMatrixUniform, false, this.mvMatrix);

    const normalMatrix = mat3.create();
    mat4.toInverseMat3(this.mvMatrix, normalMatrix);
    mat3.transpose(normalMatrix);
    gl.uniformMatrix3fv(this.program.nMatrixUniform, false, normalMatrix);
  }

  /**
   * @private
   */
  drawLogo() {
    const gl = this.gl;
    const model = this.models.logo;

    gl.useProgram(this.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, model.mesh.vertexBuffer);
    gl.vertexAttribPointer(this.program.vertexPositionAttribute, model.mesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, model.mesh.textureBuffer);
    gl.vertexAttribPointer(this.program.textureCoordAttribute, model.mesh.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, model.mesh.normalBuffer);
    gl.vertexAttribPointer(this.program.vertexNormalAttribute, model.mesh.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, model.mesh.vertexTransitionBuffer);
    gl.vertexAttribPointer(this.program.vertexTransitionAttribute, model.mesh.vertexTransitionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.mesh.indexBuffer);
    this.setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, model.mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  }

  /** @inheritDoc */
  render(timestamp) {
    super.render(timestamp);
    if (!this.program) {
      return;
    }

    const gl = this.gl;
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // gl.uniform1f(this.program.time, this.mousePos.x * 10);
    gl.uniform1f(this.program.time, timestamp);

    this.transitionValue += (this.transitionTarget - this.transitionValue) / 15;
    gl.uniform1f(this.program.transition, this.transitionValue);

    gl.uniform2f(this.program.mousePos,
      this.mousePos.x,
      this.mousePos.y
    );

    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.01, 1000.0, this.pMatrix);
    vec3.negate(this.camera.position, this.camera.inversePosition);
    mat4.identity(this.mvMatrix);

    mat4.rotate(this.mvMatrix, this.degToRad(this.camera.pitch), [1, 0, 0]);
    mat4.rotate(this.mvMatrix, this.degToRad(this.camera.heading), [0, 1, 0]);
    mat4.translate(this.mvMatrix, this.camera.inversePosition);

    mat4.scale(this.mvMatrix, this.logo.scale);

    mat4.translate(this.mvMatrix, this.logo.position);
    mat4.rotate(this.mvMatrix, this.degToRad(-95), [0,1,0]);

    // Map mouse (0:1) to rotation (-17:17)
    this.mousePos.x += (this.mousePosTarget.x - this.mousePos.x) / 20;
    const xRot = this.degToRad((1 - this.mousePos.x) * (17 + 17) - 17);
    mat4.rotate(this.mvMatrix, xRot, [1,0,0]);

    // Map mouse (0:1) to rotation (-17:17)
    this.mousePos.y += (this.mousePosTarget.y - this.mousePos.y) / 20;
    const zRot = this.degToRad((1 - this.mousePos.y) * (17 + 17) - 17);
    mat4.rotate(this.mvMatrix, zRot, [0,0,1]);

    this.drawLogo();
  }
}