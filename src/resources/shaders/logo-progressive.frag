precision highp float;

uniform vec2 uResolution;
uniform sampler2D tVelocity;
uniform sampler2D tPosition;
uniform sampler2D tAttraction;
uniform sampler2D tNextAttraction;
uniform float fadeInProgress;
uniform float fadeOutProgress;
uniform float uScaling;
uniform sampler2D tMask;
uniform float uCorrector;

//debug uniforms:
uniform vec2 uMouse;
uniform vec2 uMouseVec;

varying vec2 vUv;
varying vec4 vVelocity;
varying vec2 vPosCoords;

// standart euclidean norm
float norm(vec2 vector) {
  return sqrt(pow(vector.x,2.) + pow(vector.y,2.));
}

//mouse expermintets
float drawSmoothCircle(vec2 coords, float radius, float smoothValue){
  vec2 pos = coords - vUv;

  return smoothstep(length(pos), length(pos) + smoothValue, radius);
}

void main() {
  if (step(0.5, length(gl_PointCoord.xy - 0.5)) > 0.0) discard;

  float opacity = 0.0;
  vec2 fragCoord = gl_FragCoord.xy / uResolution - vec2(uCorrector,0.);
  vec4 position = texture2D(tPosition, vPosCoords);
  vec4 attractionMap = texture2D(tNextAttraction, fragCoord);

  if (position.z < fadeInProgress) {
    opacity = 1.;

    if (attractionMap.w < 1.) {
      opacity = fadeOutProgress;
    }
  }
  else {
    opacity = 0.;
  }

  vec3 color = mix(
    vec3(0.89, 0.91, 0.27), // 17Grad Yellow
    vec3(0.278, 0.278, 0.9), // 17Grad Blue
    fragCoord.x * 4.0 - 1.65
  );

  //experiments for mouse -> use position shader to determine particle position to mouse
  float indicator = drawSmoothCircle(uMouse, .1, 0.1) * drawSmoothCircle(position.xy, 1., 0.1);
  vec3 debugColor = vec3(drawSmoothCircle(uMouse, 1., 0.1), 0., 0.);

  if (indicator > 0.){
    debugColor = vec3(0.,1.,0.);
  }

  gl_FragColor = vec4(color, opacity);
}
