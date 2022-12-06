import Component from './component.js';
import Draggable from './draggable.js';
import lerp from '../math/lerp.js';
import clamp from '../math/clamp.js';
import AnimatedNumber from './animated-number.js';

const sliderRange = [Math.log(10), Math.log(300)];
const trackSize = 30;

/**
 *
 * @param {number} val
 * @return {number}
 */
const roundCurrency = (val) => {
  return Math.round(val * 1000 / 100) * 100;
}

const formatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

const formatFn = (v) => formatter.format(Math.round(v));

/**
 * @export
 * @class BudgetSlider
 * @extends {Component}
 */
export default class BudgetSlider extends Component {
  constructor() {
    super();

    /**
     * @type {number}
     * @priavte
     */
    this.minX = 0;

    /**
     * @type {number}
     * @priavte
     */
    this.maxX = 0;

    /**
     * @type {number}
     * @private
     */
    this.minEur = 20;

    /**
     * @type {number}
     * @private
     */
    this.maxEur = 35;

    /**
     * @type {number}
     * @private
     */
    this.width = 0;

    /**
     * @type {Draggable}
     * @private
     */
    this.trackMin = null;

    /**
     * @type {Draggable}
     * @private
     */
    this.trackMax = null;

    /**
     * @type {Element}
     * @private
     */
    this.trackEl = null;

    /**
     * @type {Function}
     * @private
     */
    this.updateSizeFn = this.updateSize.bind(this);

    /**
     * @type {AnimatedNumber}
     * @private
     */
    this.minNumber = null;

    /**
     * @type {AnimatedNumber}
     * @private
     */
    this.maxNumber = null;
  }

  /** @inheritDoc */
  enterDocument() {
    super.enterDocument();
    this.delay(this.updateSizeFn, 300, 'size');
  }

  /**
   *
   * @param {number} value
   * @return {number}
   */
  getEurFromValue(value) {
    return Math.exp(lerp(sliderRange[0], sliderRange[1], value / this.width));
  }

  /**
   *
   * @param {Vec} pos
   * @private
   */
  handleMinMove(pos) {
    this.minX += pos.x;
    this.minX = clamp(this.minX, 0, this.maxX - trackSize);
    this.updateValue(this.trackMin, this.minX);
    this.minEur = roundCurrency(this.getEurFromValue(this.minX));
    // this.outputEur();
    this.minNumber.setValue(this.minEur);
    this.updateTrack();
  }

  /**
   *
   * @param {Vec} pos
   * @private
   */
  handleMaxMove(pos) {
    this.maxX += pos.x;
    this.maxX = clamp(this.maxX, this.minX + trackSize, this.width);
    this.updateValue(this.trackMax, this.maxX);
    this.updateTrack();
    this.maxEur = roundCurrency(this.getEurFromValue(this.maxX));
    this.maxNumber.setValue(this.maxEur);
  }

  /**
   * @return {string}
   */
  getValue() {
    return this.minEur + ' - ' + this.maxEur;
  }

  /** @inheritDoc */
  setElement(el) {
    super.setElement(el);
    this.trackMin = new Draggable({
      onMove: this.handleMinMove.bind(this)
    });
    this.trackMin.setActive(true);
    this.trackMin.setElement(this.childElement('.track-min'));
    this.addChild(this.trackMin);
    this.trackMin.inertion = 1;

    this.trackMax = new Draggable({
      onMove: this.handleMaxMove.bind(this)
    });
    this.trackMax.setActive(true);
    this.trackMax.setElement(this.childElement('.track-max'));
    this.trackMax.inertion = 1;
    this.addChild(this.trackMax);

    this.trackEl = this.childElement('.track');

    this.minNumber = new AnimatedNumber({
      formatter: formatFn,
      value: this.minEur * 1000
    });
    this.minNumber.setElement(this.childElement('.min-value'))
    this.addChild(this.minNumber);

    this.maxNumber = new AnimatedNumber({
      formatter: formatFn,
      value: this.maxEur * 1000
    });
    this.maxNumber.setElement(this.childElement('.max-value'));
    this.addChild(this.maxNumber);
  }

  /**
   *
   * @param {number} eurValue
   * @return {number}
   * @private
   */
  getValueFromEur(eurValue) {
    const amount = (Math.log(eurValue) - sliderRange[0]) / sliderRange[1];
    return lerp(0, this.width, amount);
  }

  /**
   * @private
   */
  outputEur() {
    // this.minNumber.setValue(this.minEur);
    // this.maxNumber.setValue(this.minEur);
    // this.childElement('.value span:nth-of-type(1)').innerHTML = formatter.format(roundCurrency(this.minEur));
    // this.childElement('.value span:nth-of-type(3)').innerHTML = formatter.format(roundCurrency(this.maxEur));
  }

  /**
   *
   * @param {Draggable} draggable
   * @param {number} value
   * @private
   */
  updateValue(draggable, value) {
    draggable.element.style.left = `${value}px`;
  }

  /**
   * @private
   */
  updateTrack() {
    const width = this.maxX - this.minX;
    this.trackEl.style.width = width + 'px';
    this.trackEl.style.left = this.minX + 'px';
  }

  /**
   * @private
   */
  updateSize() {
    this.width = this.element.offsetWidth;

    this.minX = this.getValueFromEur(this.minEur);
    this.maxX = this.getValueFromEur(this.maxEur);

    this.updateValue(this.trackMin, this.minX);
    this.updateValue(this.trackMax, this.maxX);
    this.updateTrack();
  }
}