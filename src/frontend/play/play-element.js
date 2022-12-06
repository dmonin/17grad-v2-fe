import { Mesh, Plane, Program } from 'https://cdn.skypack.dev/ogl';
import Component from '../components/component.js';
import lerp from '../math/lerp.js';
import canvasService from '../services/canvas-service.js';

export class PlayElement extends Component {

  constructor(config) {
    super();
    this.name = config.name;
    this.id = config.id;
    this.width = config.width;
    this.collage = config.collage;
    this.position = config.position;
    this.parallax = config.parallax;
    this.zIndex = config.zIndex;
    this.lastPosition = 0;
  }

  loadTexture() {

    // canvasService.createTexture()
  }

  prepare() {
    // return new Promise(async (resolve, reject) => {
    //   const geometry = new Plane(gl);

    //   const program = new Program(gl, {
    //       vertex: `
    //           attribute vec3 position;

    //           uniform mat4 modelViewMatrix;
    //           uniform mat4 projectionMatrix;

    //           void main() {
    //               gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    //           }
    //           `,
    //       fragment: `
    //           void main() {
    //               gl_FragColor = vec4(1.0);
    //           }
    //       `,
    //   });

    //   const mesh = new Mesh(gl, {geometry, program});
    //   for (const collageItem of this.collage) {
    //     const img = new Image();
    //     img.width = this.collage.width + 'vw';
    //     img.srcset = collageItem.responsive.srcset;
    //     canvasService.createTexture(img);
    //   }

    //   resolve(mesh);
    //   // this.loadTexture();
    // });
  }

  /**
   *
   * @param {number} vwPos
   */
  updatePosition(vwPos = this.lastPosition) {
    const min = this.position.x - 100 - this.width - this.parallax;
    const max = this.position.x + this.width + this.parallax;
    if (vwPos < min || vwPos > max) {
      return;
    }

    const position = (vwPos - min) / (max - min);
    if (this.parallax) {
      const offset = lerp(-this.parallax, this.parallax, position);
      this.element.style.transform = `translateX(${offset}vw)`;
    }

    this.lastPosition = vwPos;
  }
}
