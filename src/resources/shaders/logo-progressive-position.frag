precision highp float;

uniform float uTime;
uniform sampler2D tVelocity;
uniform sampler2D tAttraction;
uniform vec2 uResolution;
// Default texture uniform for GPGPU pass is 'tMap'.
// Can use the textureUniform parameter to update.
uniform sampler2D tMap;
varying vec2 vUv;

void main() {
  vec4 position = texture2D(tMap, vUv);
  vec4 velocity = texture2D(tVelocity, vUv);
  position.xy += velocity.xy * 0.01;

  vec2 limits = vec2(1);
  position.xy += (1.0 - step(-limits.xy, position.xy)) * limits.xy * 3.0;
  position.xy -= step(limits.xy, position.xy) * limits.xy * 3.0;

  gl_FragColor = position;
}
