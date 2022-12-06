import { Renderer, Camera, Transform, Texture } from 'https://cdn.skypack.dev/ogl';
class CanvasService {
  constructor() {

    /**
     * @type {HTMLCanvasElement}
     */
    this.canvas = null;

    /**
     * @type {Renderer}
     */
    this.renderer = null;

    /**
     * @type {Camera}
     */
    this.camera = null;

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
     * @type {number}
     */
    this.viewportWidth = 0;

    /**
     * @type {number}
     */
    this.viewportHeight = 0;

    /**
     * @type {boolean}
     * @private
     */
    this.updateRequested = false;

    /**
     * @type {Map<string, Promise}
     * @private
     */
    this.shaderPromises = new Map();

    /**
     * Post Processer
     * @type {Post}
     */
    this.post = null;
  }

  /**
   * Creates texture from image
   *
   * @param {Image|string} img
   * @param {Renderer} renderer
   */
   createTexture(img, renderer = this.renderer) {
    if (typeof img == 'string') {
      const src = img;
      img = new Image();
      img.src = src;
    }

    return new Promise((resolve, reject) => {
      const texture = new Texture(renderer.gl, {
        generateMipmaps: false
      });

      if (img.complete) {
        texture.image = img;
        resolve(texture);
      } else {
        img.onload = () => {
          texture.image = img;
          resolve(texture);
        }
      }
    });
  }


  /**
   * @private
   */
  frame() {
    this.updateRequested = false;
    const { scene, camera } = this;

    if (this.post) {
      this.post.render({ scene, camera });
    } else {
      this.renderer.render({ scene, camera });
    }
  }

  /**
   * Initializes WebGL Rendering
   */
  initialize() {
    const canvas = document.getElementById('bg-canvas');
    this.renderer = new Renderer({
      alpha: true,
      canvas
    });

    this.canvas = canvas;
    const camera = new Camera(this.renderer.gl);
    camera.fov = 45;
    camera.position.z = 5;
    this.camera = camera;

    this.updateSize();

    requestAnimationFrame(this.frameFn);

    window.addEventListener('resize', this.handleResize.bind(this));

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
   * Updates size on window resize.
   *
   * @private
   */
  handleResize() {
    this.updateSize();
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

  removePass(pass) {
    const index = this.post.passes.indexOf(pass)
    this.post.passes.splice(index,1)
  }

  removeSceneElements(elements) {
    for (const el of elements) {
      this.scene.removeChild(el)
    }
  }

  /**
   * Loads shaders from server and returns them as object map.
   *
   * @param  {...string} shaders
   * @return {Object}
   */
  shaders(...shaders) {
    const key = shaders.join(',');
    if (this.shaderPromises.has(key)) {
      return this.shaderPromises.get(key);
    }

    const promise = new Promise(async (resolve, reject) => {
      const response = await fetch('/api/shaders?shaders=' + key, {
        method: 'get'
      });
      resolve(await response.json());
    });
    this.shaderPromises.set(key, promise);
    return promise;
  }

  /**
   * Updates canvas size
   */
   updateSize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.perspective({
      aspect: this.renderer.width / this.renderer.height,
    });

    const fov = this.camera.fov * (Math.PI / 180)
    this.viewportHeight = 2 * Math.tan(fov / 2) * this.camera.position.z
    this.viewportWidth = this.viewportHeight * this.camera.aspect;
  }
}

const canvasService = new CanvasService();
export default canvasService;