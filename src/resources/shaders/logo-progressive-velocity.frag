precision highp float;

uniform float uTime;
uniform float uResolution;
uniform float uOrbitSpeed;
uniform float uScalarX;
uniform float uScalarY;
uniform float uAngle;
uniform float uEntropy;
uniform float uSpeedUp;
uniform sampler2D tPosition;
uniform sampler2D tMap;
uniform sampler2D tAttraction;
uniform vec2 uAttractionCenter;
varying vec2 vUv;
uniform bool uText;
uniform sampler2D tMask;

// mouse uniforms (not used as of now)
uniform vec2 uMouse;
uniform vec2 uMouseVec;

float PI = 3.14157;

// increases velocity of particle based on attraction map
float particleAccelarator(vec4 map, float deg, float speed){
  return speed * pow(max(map.r, map.b / 1000.), deg);
}

// returns point on ellipitic shape based on time variable
vec2 constructOrbit(vec2 scalar, vec2 transposition, float time, float angle) {
  return scalar * (vec2(cos(time - angle), sin(time - angle)) + transposition);
}

// attraction methods:

// get attraction vector
vec2 attractionVector(vec2 start, vec2 goal, float strength) {
  float scalingFactor = 0.0205 * uSpeedUp; // otherwise particles will move super fast
  vec2 attractionVec = goal - start; // -> start + attr.vec = end

  return strength * normalize(attractionVec) * scalingFactor; //normalize -> norm(vec) * strength = strength
}

// default attraction for particles outside of the triangle, draws particles to triangle centers
vec2 defaultAttraction(vec2 pos) {
  vec2 attractionCenter;

  if (pos.x < 0.) {
    attractionCenter = -uAttractionCenter;
  }
  else {
    attractionCenter = uAttractionCenter;
  }

  float strength = smoothstep(0.6, 0.0, length(attractionCenter));

  return attractionVector(pos.xy, attractionCenter, strength);
}

// particles are attracted to a point moving around on an orbit. Reduced movement is achieved by contracting the movement.
vec2 triangleMovement(vec2 partPos, vec2 orbit, float entropy){
  vec2 attractionCenter; // moves around
  float strength;

  if (partPos.x < 0.) {
    attractionCenter = orbit;
    strength = smoothstep(attractionCenter.x, attractionCenter.x * 0.5, length(attractionCenter));
  }
  else {
    attractionCenter = vec2(-1.,1.) * orbit; //mirror orbit on y-axis
    strength = smoothstep(attractionCenter.x * 0.5, attractionCenter.x, length(attractionCenter));
  }

  // if particle x position isn't same as attraction center, increase strength
  if (attractionCenter.x != partPos.x) {
    strength *= entropy;
  }

  return attractionVector(partPos.xy, attractionCenter, strength);
}

// maybe change to vec2 function in order to differentiate .x and .y velocity and have friction applied on them independently?
float friction(vec4 particleMap, vec2 currentVelocity, vec4 torchEffectMap) {
  float speedThreshold = 0.65;

  if (currentVelocity.x + currentVelocity.y < speedThreshold) {
    return 1.; //don't slow down any further
  }

  // alternatively for sparse particle distribution and faster particles:
  // float speedThreshold = 0.009;
  // if (currentVelocity.x < speedThreshold ||currentVelocity.y < speedThreshold) {
  //   return 1.; //don't slow down any further
  // }

  if(uText) {
    if (abs(particleMap.r - particleMap.b) > 0.3) {
      return 0.;
    }
    else {
      return 1.;
    }
  }
  else {
    //friction dependent on attraction map
    float oldVer = particleAccelarator(vec4(1.) - torchEffectMap, 9., 10.);
    float torch = 0.5 * pow(torchEffectMap.r - torchEffectMap.b, 5.); // need odd exponent otherwise value will always be positive

    if (torch < 0.) {
      torch = 0.;
    }
    return torch;
  }
}

//////////////////////

void main() {
  // current particle position
  vec4 position = texture2D(tPosition, vUv);
  // speed which will be changed here
  vec4 velocity = texture2D(tMap, vUv);

  // particle coordinates based on position (just a little transformed)
  vec2 particleCoords = vec2(0.5) -  0.55 * vec2(1., 0.55) * position.xy;

  // varying attraction map based on current position status
  vec4 particleMap = texture2D(tAttraction,particleCoords);

  // map for torch effect
  vec4 torchEffectMap = texture2D(tMask, particleCoords);

  // values that can be changed:
  float effectArea = 1.; // 1 = every particle, 0.5 = 0.5 radius from center

  // orbit parameters, check function constructOrbit for details
  vec2 scalar = vec2(uScalarX,uScalarY);
  vec2 transposition = vec2(0., 0.);
  float angle = uAngle * -PI / 180.;

  // factor which makes it look "chaotic"
  float entropy = uEntropy;

  // don't change anything here:
  float time = uTime * uOrbitSpeed;

  if (particleMap.r < 0.3 && length(vec2(0.5) - particleCoords) < effectArea) {
    velocity.xy += defaultAttraction(position.xy); //+ 0.01 * mouseAffectedMovement(uMouse, uMouseVec);
  }
  else if (particleMap.r > 0.3 && !uText) {
    vec2 orbit = constructOrbit(scalar, transposition, time, angle);

    // default movement for particles inside the triangle
    velocity.xy += triangleMovement(position.xy, orbit, entropy); // + 0.001* mouseAffectedMovement(uMouse, uMouseVec);
  }
  else if (particleMap.r > 0.3 && uText) {
    vec2 orbit = constructOrbit(.5 * vec2(-1., -1.), vec2(0., 0.), time, angle);

    // default movement for particles inside the triangle
    velocity.xy += abs(sin(time)) * triangleMovement(position.xy, orbit, entropy);
  }

  // Friction
  velocity.xy *= friction(particleMap, velocity.xy, torchEffectMap);

  //gl_FragColor = vec4(0.);
  gl_FragColor = velocity;
}
