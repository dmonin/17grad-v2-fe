#version 300 es
precision mediump float;

uniform vec2 u_Resolution;
uniform vec3 u_InnerColor;
uniform vec3 u_OuterColor;

out vec4 o_FragColor;

//  Function from Iñigo Quiles
//  www.iquilezles.org/www/articles/functions/functions.htm
float parabola(float x, float k) {
  return pow(4.0*x*(1.0-x), k);
}

void main() {
  vec2 position = (gl_FragCoord.xy / u_Resolution.xy);

  float value = parabola(position.x, 4.0);
  vec3 finalColor = mix(u_InnerColor, u_OuterColor, value);

  o_FragColor = vec4(finalColor, 1.0);
}
