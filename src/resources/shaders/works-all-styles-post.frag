precision highp float;

uniform sampler2D tMap;
uniform sampler2D displacement;
uniform float uTime;
uniform vec2 uMousePosition;
uniform float uProgress;
uniform float uBlindspot;
uniform float uDirection;
uniform bool corporate;

varying vec2 vUv;

float drawCircle(vec2 coords, float radius){
    vec2 pos =coords - vUv;
    return smoothstep(length(pos), length(pos), radius);
}

float drawSmoothCircle(vec2 coords, float radius, float smoothValue){
    vec2 pos =coords - vUv;
    return smoothstep(length(pos), length(pos) + smoothValue, radius);
}

vec2 displacementFunction(vec4 map, float strength, float progress){
    return vec2(vUv.x + progress/pow(2.,strength) * map.r, 
    vUv.y + 0.5*(-progress)/exp(2.*strength) * map.r);
}

float parabola(float x, float a, float b, float c) {
    return a * pow((x-b),2.) + c;
}

vec2 corporateDisplacement(float progress, float strength) {
    return vec2(vUv.x + uDirection * parabola(vUv.y,1.25,.25,0.) * progress * 0.5 * strength, vUv.y);
}

void main() {
    vec4 texture = texture2D(tMap, vUv);
    float radius = 0.07;
    vec4 circle = vec4(vec3(drawCircle(uMousePosition,radius)),1.); 
    vec4 dispMap = texture2D(displacement, vUv);
    float p = uProgress + 0.15 * drawSmoothCircle(uMousePosition, radius, 0.1);
    vec2 displacedCoords;
    if (corporate) {
        displacedCoords = corporateDisplacement(uProgress, 1.);
    }
    else {
        displacedCoords = displacementFunction(dispMap, .5, p);
    }
    vec4 displaced = texture2D(tMap, displacedCoords);
    gl_FragColor = displaced;
}

