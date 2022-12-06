precision highp float;

uniform float uTime;
uniform mat3 uBlueCircles;
uniform mat3 uYellowCircles;
uniform float uFadeOut;

varying vec2 vUv;

/*
 * Colors
 */
vec3 blue = vec3(92./255., 92./255., 239./255.);
vec3 yellow = vec3(228./255., 234./255., 69./255.);
vec3 white = vec3(1.);
vec3 gray = vec3(0.95);

vec2 adjustCoords(vec2 coordInput) {
  return vUv - coordInput;
}

// Combines three circles,
// min is required to make sure their color value doesn't exceed 1
float combineCircles(float c1, float c2, float c3){
  return min(c1 + c2 + c3, 1.);
}

// draws circle using smoothstep
// increasing smoothness will make the circle smaller and almost disappear
float drawCircle(vec2 coords, float radius) {
  vec2 center = adjustCoords(coords);
  float smoothness = uFadeOut + 0.1;
  return smoothstep(length(center), length(center) + smoothness, radius);
}

// Draws three circles and returns them as vec3
vec3 drawThreeCircles(mat3 data){
  float c1 = drawCircle(data[0].xy, data[0].z);
  float c2 = drawCircle(data[1].xy, data[1].z);
  float c3 = drawCircle(data[2].xy, data[2].z);
  float c = combineCircles(c1, c2, c3);
  return vec3(c);
}

// overlaps circles
// max is required to ensure that the circle won't have negative value
vec3 overlapCircles(vec3 c1, vec3 c2, vec3 color1, vec3 color2) {
  vec3 result = max(c2 * color2 - c1, 0.) + c1 * color1;
  return result;
}

void main() {
  vec3 blueCircles = drawThreeCircles(uBlueCircles);
  vec3 yellowCircles = drawThreeCircles(uYellowCircles);

  vec3 colorOverlap = overlapCircles(blueCircles, yellowCircles, blue, yellow);
  vec3 holeOverlap = overlapCircles(blueCircles, yellowCircles, white, white);

  vec3 backgroundHole = gray - min(holeOverlap, vec3(1.));

  vec4 result = vec4(colorOverlap + backgroundHole, 1.);

  gl_FragColor = result;
}