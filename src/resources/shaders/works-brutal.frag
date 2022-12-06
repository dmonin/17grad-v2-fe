precision highp float;

uniform sampler2D tMap;
uniform sampler2D tMap2;
uniform sampler2D tDisplacement;
uniform float uProgress;

varying vec2 vUv;

vec2 displacementFunction(vec4 map, float strength, float progress){
    float xDisplacement = progress/pow(strength,.33);
    float yDisplacement = -0.5*progress/exp(2.*strength);
    return vUv + vec2(xDisplacement,yDisplacement)*map.r;    
}

void main() {
    vec4 displacementMap = texture2D(tDisplacement, vUv);
    vec2 displacedCoords = displacementFunction(displacementMap, 0.5, uProgress);
    vec4 displacedImage = texture2D(tMap, displacedCoords);
    
    vec2 invertedDisplacedCoords = displacementFunction(displacementMap, 0.5, 1. - abs(uProgress));
    vec4 secondImage = texture2D(tMap2, invertedDisplacedCoords);
    gl_FragColor = mix(displacedImage, secondImage, abs(uProgress));
}