import Vec from '../math/vec.js';
import Component from './component.js';
import cursor from './cursor.js';

/**
 * Events: onMove
 *
 * @export
 * @class Logo
 * @extends {Component}
 */
export default class Draggable extends Component {
  constructor(props) {
    super(props);

    /**
     * @type {Vec}
     * @private
     */
    this.lastPos = new Vec();

    /**
     * @type {Vec}
     */
    this.inertionPos = new Vec();

    /**
     * @type {Vec}
     * @private
     */
    this.position = new Vec();

    /**
     * @type {Vec}
     * @private
     */
    this.cursorPos = new Vec();

    /**
     * @type {boolean}
     */
    this.isActive = false;

    /**
     * @type {{x: number, y: number}}
     * @private
     */
    this.velocity = new Vec();

    /**
     * @boolean
     */
    this.isDragging = false;

    /**
     * @type {number}
     */
    this.inertion = 1 / 14;

    /**
     * @type {number}
     */
    this.friction = 1 / 10;

    /**
     * For faster access
     * @private
     */
    this.animFn = this.animate.bind(this);

    /**
     * @type {string}
     */
    this.direction = 'x';
  }

  /**
   * @private
   */
  animate(time) {
    if (this.isDisposed) {
      return;
    }
    this.velocity = this.cursorPos.delta(this.inertionPos);

    this.inertionPos.add(this.frictionVelocity(this.inertion));

    if (this.velocity.magnitude() < 1) {
      this.inertionPos = this.cursorPos.clone();
      this.velocity.set(0, 0);

      if (!this.isDragging && this.props.onEnd) {
        this.props.onEnd();
      }
    }

    if (this.isDragging) {
      this.position = this.cursorPos.clone();
    }
    else {
      this.position.add(this.frictionVelocity(this.friction));
    }

    if (this.props.onMove) {
      const movement = this.position.clone().delta(this.lastPos);
      if (Math.abs(movement.x) > 0 || Math.abs(movement.y) > 0) {
        this.props.onMove(movement);
      }
    }

    this.lastPos = this.position.clone();
    this.nextFrame();
  }

  /**
   *
   * @param {number} friction
   * @return {number}
   * @private
   */
  frictionVelocity(friction) {
    const velocity = this.velocity.clone();
    return this.direction == 'xy' ?
      velocity.scaleMagnitude(friction) :
      velocity.scale(friction);
  }

  /**
   * @return {{distance: number, count: number}}
   * @private
   */
  calculateEnd() {
    const cx = this.cursorPos.x;
    let vx = this.velocity.x;
    let ix = this.inertionPos.x;
    let count = 0;
    let distance = 0;
    while (vx >= 1) {
      vx = cx - ix;
      ix += vx / this.inertion

      distance += vx * this.friction;
      count++;
      if (count > 10000) {
        break;
      }
    }

    return {
      distance,
      count
    };
  }

  /** @inheritDoc */
  dispose() {
    super.dispose();

    cursor.reset();

    this.velocity = null;
    this.animFn = null;
    this.cursorPos = null;
    this.inertionPos = null;
    this.position = null;
  }

  /** @inheritDoc */
  enterDocument() {
    super.enterDocument();
    this.on('pointerdown', this.handlePointerDown, null, {
      passive: false
    });

    this.on('mouseover', this.handleMouseEnter);
    this.on('mouseleave', this.handleMouseLeave);
  }

  /**
   *
   * @param {MouseEvent} e
   * @private
   */
  handleMouseEnter(e) {
    if (this.isActive &&
      cursor.currentState.cls != 'drag' && !this.isDragging) {

      if (e.target.closest('[data-no-drag-cursor]')) {
        return;
      }

      cursor.setState({
        cls: 'drag',
        icon: 'drag',
        text: 'Drag'
      });
    }
  }

  /**
   *
   * @param {MouseEvent} e
   * @private
   */
  handleMouseLeave(e) {
    if (this.isActive) {
      cursor.reset();
    }
  }

  /**
   * @param {PointerEvent} e
   * @private
   */
  handlePointerDown(e) {
    if (e.button != 0 || !this.isActive) {
      return;
    }

    // Reset
    this.velocity.x = 0;
    this.cursorPos = new Vec(e.clientX, e.clientY);
    this.position = new Vec(e.clientX, e.clientY);
    this.lastPos = new Vec(e.clientX, e.clientY);
    this.inertionPos = new Vec(e.clientX, e.clientY);

    const doc = document.documentElement;
    this.on('pointermove', this.handlePointerMove, doc);
    this.on('pointerup', this.handlePointerUp, doc);

    if (this.props.onStart) {
      this.props.onStart();
    }

    cursor.setState({
      cls: 'dragging',
      icon: 'drag',
      text: 'Drop'
    });
  }

  /**
   * @param {PointerEvent} e
   * @private
   */
  handlePointerMove(e) {
    if (this.isDisposed) {
      return;
    }

    const pos = new Vec(e.clientX, e.clientY);
    if (!this.isDragging) {
      const delta = pos.delta(this.cursorPos);
      const isDirectionX = Math.abs(delta.x) > Math.abs(delta.y);
      if (isDirectionX && this.direction == 'x') {
        this.isDragging = true;
        this.nextFrame();
      }
    }

    if (this.isDragging) {
      e.preventDefault();
      this.cursorPos = pos;
    }
  }

  /**
   * @param {PointerEvent} e
   * @private
   */
  handlePointerUp(e) {
    if (this.isDisposed) {
      return;
    }

    this.isDragging = false;

    const doc = document.documentElement;
    this.off('pointermove', this.handlePointerMove, doc);
    this.off('pointerup', this.handlePointerUp, doc);

    if (this.props.onRelease) {
      const end = this.calculateEnd(this.velocity);
      this.props.onRelease(this.velocity, new Vec(end.distance));
      this.inertionPos = this.cursorPos.clone().delta(this.velocity);
    }

    if (this.velocity.x == 0 && this.props.onEnd) {
      this.props.onEnd();
    }

    cursor.setState({
      cls: 'drag',
      icon: 'drag',
      text: 'Drag'
    });
  }

  /**
   * @private
   */
  nextFrame() {
    if (this.isDisposed) {
      return;
    }

    if (this.velocity.magnitude() > 0 || this.isDragging) {
      requestAnimationFrame(this.animFn);
    }
  }

  /**
   *
   * @param {boolean} isActive
   */
  setActive(isActive) {
    this.isActive = isActive;
  }
}