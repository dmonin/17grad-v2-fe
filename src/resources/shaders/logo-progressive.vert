precision highp float;

attribute vec2 coords;
attribute vec4 random;

uniform float uTime;
uniform sampler2D tPosition;
uniform sampler2D tVelocity;

varying vec4 vRandom;
varying vec4 vVelocity;
varying vec2 vUv;
varying vec2 vPosCoords;

void main() {
  vRandom = random;

  // Get position from texture, rather than attribute
  vec4 position = texture2D(tPosition, coords);
  vVelocity = texture2D(tVelocity, coords);
  vPosCoords = coords;

  gl_Position = vec4(position.xy, 0, 1);
  gl_PointSize = 3.0;
}
