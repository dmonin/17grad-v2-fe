import { Vector3, Clock, BufferAttribute, BufferGeometry, Scene, BoxGeometry, MeshBasicMaterial, MeshPhongMaterial, AmbientLight, PointLight, Mesh, PerspectiveCamera, WebGLRenderer, DoubleSide } from 'three';
import * as dat from 'dat.gui';
import Component from '../components/component.js';

export class PlayArea extends Component {
  constructor() {
    super({});

    this.clock = new Clock();

    /**
     * @type {THREE.Scene}
     * @private
     */
    this.scene = null;

    /**
     * @type {THREE.WebGLRenderer}
     * @private
     */
    this.renderer = null;

    /**
     * @type {THREE.PerspectiveCamera}
     * @private
     */
    this.camera = null;

    /**
     * @type {Function}
     * @private
     */
    this.frameFn = this.frame.bind(this);
  }

  initGui() {
    /**
     * Debug
     */
    const gui = new dat.GUI()
    gui.add(this.camera.position, 'x', -2, 15, 0.01);
    gui.add(this.camera.position, 'z', 2, 15, 0.01);
  }

  /**
   *
   * @param {THREE.Scene} scene
   */
  createRoom(scene) {
    const positionsArray = new Float32Array(9)

    // First vertice
    positionsArray[0] = 0;
    positionsArray[1] = 0;
    positionsArray[2] = 0;

    // Second vertice
    positionsArray[3] = 0;
    positionsArray[4] = 1;
    positionsArray[5] = 0;

    // Third vertice
    positionsArray[6] = 1;
    positionsArray[7] = 0;
    positionsArray[8] = 0;

    const positionsAttribute = new BufferAttribute(positionsArray, 3)

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', positionsAttribute);

    const color = new Float32Array(
      1, 1, 0,
      1, 1, 0,
      1, 1, 0
    );
    const colorsAttribute = new BufferAttribute(color, 3)
    // geometry.setAttribute('color', colorsAttribute);

    const pA = new Vector3();
    const pB = new Vector3();
    const pC = new Vector3();
    pA.set( 0, 0, 0 );
    pB.set( 0, 1, 0 );
    pC.set( 1, 0, 0 );

    const cB = new Vector3();
    cB.subVectors(pC, pB);
    const aB = new Vector3();
    aB.subVectors(pA, pB);
    cB.cross(aB);
    cB.normalize();

    const normals = new Float32Array([
      cB.x, cB.y, cB.z,
      cB.x, cB.y, cB.z,
      cB.x, cB.y, cB.z
    ]);

    const normalsAttribute = new BufferAttribute(normals, 3)
    geometry.setAttribute('normal', normalsAttribute);

    const material = new MeshPhongMaterial({
      side: DoubleSide
    });
    geometry.computeBoundingSphere();
    const mesh = new Mesh(geometry, material);
    scene.add(mesh);
  }

  /**
   * @inheritdoc
   */
  enterDocument() {
    super.enterDocument();

    // Scene
    this.scene = new Scene();

    // Object
    const geometry = new BoxGeometry(0.25, 7, 7)
    const material = new MeshPhongMaterial();
    const mesh = new Mesh(geometry, material);
    mesh.position.z = -1;

    const mesh2 = new Mesh(geometry, material);
    mesh2.position.z = -1;
    mesh2.position.x = 7;

    const backGeo = new BoxGeometry(7, 7, 0.25)
    const mesh3 = new Mesh(backGeo, material);
    mesh3.position.z = -4.5;
    mesh3.position.x = 3.5;

    this.scene.add(mesh, mesh2, mesh3);

    // this.createRoom(this.scene, material);

    const ambientLight = new AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const pointLight = new PointLight(0xffffff, 0.5);
    pointLight.position.set(1, 1, 3);
    this.scene.add(pointLight)

    // Sizes
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    // Camera
    this.camera = new PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100);
    this.camera.position.x = 1;
    this.camera.position.y = -1.5;
    this.camera.position.z = 3;
    this.scene.add(this.camera);

    // Renderer
    this.renderer = new WebGLRenderer({
      canvas: this.element,
      alpha: true
    });

    this.renderer.setSize(sizes.width, sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    requestAnimationFrame(this.frameFn);

    this.initGui();
  }

  frame() {
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.frameFn);
  }
}

const canvas = document.querySelector('canvas.webgl')

const play = new PlayArea();
play.decorate(canvas);