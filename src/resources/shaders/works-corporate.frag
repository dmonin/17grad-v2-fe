precision highp float;

uniform sampler2D tMap;
uniform sampler2D tDisplacement;
uniform float uProgress;

varying vec2 vUv;
float threshold = 0.05;


vec2 displacementFunction(vec4 map, float strength, float progress){
    float xDisplacement = progress / pow(strength, .33);
    float yDisplacement = -0.5 * progress/exp(2. * strength);
    return vUv + vec2(xDisplacement, yDisplacement) * map.r;
}
    
void main() {
    gl_FragColor = texture2D(tMap, vUv);
}