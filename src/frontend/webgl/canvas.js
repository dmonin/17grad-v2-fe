import Component from '../components/component.js';

export class Canvas extends Component {

  /** @inheritDoc */
  constructor() {
    super();

    /**
     * @type {WebGLRenderingContext}
     * @private
     */
    this.gl = null;

    /**
     * @type {Object}
     * @protected
     */
    this.canvasBoundingBox = {};

    /**
     * @type {Object}
     * @protected
     */
    this.mousePos = {
      x: 0,
      y: 0
    };

    /**
     * @type {Function}
     * @private
     */
    this.renderFn = this.render.bind(this);

    /**
     * @type {Function}
     * @private
     */
    this.handleResizeFn = this.handleResize.bind(this);
  }

  /** @inheritDoc */
  enterDocument() {
    super.enterDocument();

    this.handleResizeFn();

    this.setWebglVersion();

    this.on('pointermove', this.handlePointerMove, window);
    this.on('touchend', this.handleTouchEnd);
    this.on('resize', this.handleResizeDelayed, window);
  }

  /**
   * @protected
   */
  setWebglVersion() {
    this.gl = this.element.getContext('webgl');
  }

  /**
   * @param {MouseEvent} e
   * @protected
   */
  handlePointerMove(e) {
    this.mousePos.x = (e.pageX - this.canvasBoundingBox.left) / this.canvasBoundingBox.width;
    this.mousePos.y = 1.0 - ((e.pageY - this.canvasBoundingBox.top) / this.canvasBoundingBox.height);
  }

  /**
   * @param {TouchEvent} e
   * @private
   */
  handleTouchEnd(e) {
    this.mousePos.x = 0.0;
    this.mousePos.y = 0.0;
  }

  /**
   * @private
   */
  handleResizeDelayed() {
    this.delay(this.handleResizeFn, 300, 'resize');
  }

  /**
   * @protected
   */
  handleResize() {
    this.canvasBoundingBox = this.element.getBoundingClientRect();
  }

  /**
   *
   * @param {string} shaderSource
   * @param {number} shaderType
   * @returns {WebGLShader}
   * @private
   */
  createShader(shaderSource, shaderType) {
    const gl = this.gl;
    const shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
      const lastError = gl.getShaderInfoLog(shader);
      console.error('Error compiling shader \'' + shader + '\':' + lastError);
    }

    return shader;
  }

  /**
   *
   * @param {string} vertexShader
   * @param {string} fragmentShader
   * @param {Object} transformFeedbackVaryings
   * @returns {WebGLProgram}
   * @protected
   */
  createProgram(vertexShader, fragmentShader, transformFeedbackVaryings = null) {
    const gl = this.gl;
    const program = gl.createProgram();

    const vert = this.createShader(vertexShader, gl.VERTEX_SHADER);
    gl.attachShader(program, vert);

    const frag = this.createShader(fragmentShader, gl.FRAGMENT_SHADER);
    gl.attachShader(program, frag);

    if (transformFeedbackVaryings) {
      gl.transformFeedbackVaryings(program, transformFeedbackVaryings, gl.INTERLEAVED_ATTRIBS);
    }

    gl.linkProgram(program);

    const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
      const lastError = gl.getProgramInfoLog(program);
      console.error('Error linking program: ' + lastError);
    }

    return program;
  }

  /**
   *
   * @param {Array<Object>} buffers
   * @param {WebGLVertexArrayObject} vao
   * @param {number} stride
   * @protected
   */
  setupBufferVAO(buffers, vao, stride) {
    const gl = this.gl;
    gl.bindVertexArray(vao);

    for (let i = 0; i < buffers.length; i++) {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers[i].bufferObject);
      let offset = 0;

      for (let attribName in buffers[i].attribs) {
        if (buffers[i].attribs.hasOwnProperty(attribName)) {
          const attribDesc = buffers[i].attribs[attribName];
          gl.enableVertexAttribArray(attribDesc.location);
          gl.vertexAttribPointer(
            attribDesc.location,
            attribDesc.numComponents,
            attribDesc.type,
            false,
            stride,
            offset);

          offset += attribDesc.numComponents * 4;
        }
      }
    }

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  /**
   * Takes normalized value and transforms to range -1 : 1
   *
   * @param {number} value
   * @return {number}
   * @protected
   */
  toScreenVal(value) {
    return (value - 0.5) * 2.0;
  }

  /**
   * Conserve aspect ratio of the original region
   *
   * @param {Number} srcWidth width of source image
   * @param {Number} srcHeight height of source image
   * @param {Number} maxWidth maximum available width
   * @param {Number} maxHeight maximum available height
   * @return {Object} { width, height }
   * @protected
   */
   calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
     var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
     return { width: srcWidth*ratio, height: srcHeight*ratio };
   }

  /**
   * @param {number} timestamp
   * @private
   */
  render(timestamp) {
    if (this.isDisposed) {
      return;
    }

    // Clear the canvas
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    window.requestAnimationFrame(this.renderFn);
  }
}
