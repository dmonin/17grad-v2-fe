precision highp float;

uniform sampler2D tMap;
uniform float uTime;
uniform float uSpeed;
varying vec2 vUv;
uniform float uNoise;

float random(vec2 p)
{
  vec2 K1 = vec2(
    23.14069263277926, // e^pi (Gelfond's constant)
    2.665144142690225 // 2^sqrt(2) (Gelfond–Schneider constant)
  );
  return fract( cos( dot(p, K1) ) * 12345.6789);
}

void main() {
  vec2 uv = vUv;
  vec4 texture = texture2D(tMap, uv);
  uv.y *= random(vec2(uv.y,uTime));
  texture.rgb += random(uv) * 0.015 * uNoise;
  gl_FragColor = texture;
}