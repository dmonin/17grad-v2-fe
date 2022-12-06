attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;
attribute float aVertexTransition;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat3 uNMatrix;
uniform float iTransition;

varying vec2 vTextureCoord;
varying vec3 vTransformedNormal;
varying vec4 vPosition;
varying vec4 vColor;

float rand(vec2 co) {
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main(void) {
  vPosition = uMVMatrix * vec4(aVertexPosition, 1.0);

  vec4 position = uPMatrix * vPosition;

  vTextureCoord = aTextureCoord;
  vTransformedNormal = uNMatrix * aVertexNormal;

  position += vec4(vTransformedNormal, 0.0) * (aVertexTransition * iTransition);

  gl_Position = position;
}
