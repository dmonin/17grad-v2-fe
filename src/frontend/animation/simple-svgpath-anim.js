import lerp from '../math/lerp.js';

const numRe = /[0-9.]+/g;
function numValuesFromString(str) {
  return str.match(numRe).map(v => parseFloat(v))
}

function path(values) {
  let index = 0;
  return this.from.replace(numRe, () => {
    return values[index++];
  });
}

function position(pos) {
  let val = [];
  this.fromValues.forEach((v, i) => {
    val.push(lerp(v, this.toValues[i], pos));
  });
  return this.path(val);
}

export default (from, to) => {
  const fromValues = numValuesFromString(from);
  const toValues = numValuesFromString(to);

  return {
    from,
    fromValues,
    position,
    to,
    toValues,
    path
  }
};