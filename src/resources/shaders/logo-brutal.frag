#version 100
#define M_PI 3.1415926535897932384626433832795
precision mediump float;

varying vec2 vTextureCoord;
varying vec3 vTransformedNormal;

uniform float iTime;
uniform vec2 uMousePos;

uniform samplerCube envSampler;

void main(void) {
  vec4 envColor = textureCube(envSampler, vTransformedNormal);
  gl_FragColor = vec4(envColor.rgb * 0.5, 0.5);
}
