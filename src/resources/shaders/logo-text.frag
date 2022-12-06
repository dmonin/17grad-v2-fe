precision highp float;


uniform vec2 uResolution;
uniform sampler2D tVelocity;
uniform sampler2D tPosition;
uniform sampler2D tAttraction;
uniform sampler2D tMask;
uniform float fadeInProgress;
uniform float fadeOutProgress;
uniform float uScaling;
uniform float uCorrector;

varying vec2 vUv;
varying vec4 vVelocity;
varying vec2 vPosCoords;

// makes it easier to look at main method
vec3 defaultColorMix(float fct){
       return mix(
            vec3(0.89, 0.91, 0.27), // 17Grad Yellow
            vec3(0.278, 0.278, 0.9), // 17Grad Blue
            fct
        );
}

vec4 mapBasedColorMix(vec4 mask, float base_opacity, vec2 fragCoord) {
    float opacity = base_opacity;
    vec3 color;
    if (mask.b > mask.r) {
        color = mix (vec3(0.89, 0.91, 0.27),
        defaultColorMix(fragCoord.x),
        4.*fadeOutProgress); // 17Grad Yellow
    }
    else if (mask.r > mask.b) {
        color = mix (vec3(0.89, 0.91, 0.27),
        defaultColorMix(fragCoord.x),
        4.*fadeOutProgress); // 17Grad Yellow
        
    }
    else {
        color = defaultColorMix(fragCoord.x);
        opacity = max(fadeOutProgress,0.);
    }
    return vec4(color, opacity);
}

void main() {
    vec2 fragCoord = gl_FragCoord.xy / uResolution - vec2(uCorrector,0.);
    vec4 mask = texture2D(tAttraction, fragCoord);

    float opacity = mask.a;
    vec4 res = mapBasedColorMix(mask, opacity, fragCoord);
    vec3 color = mix(
    vec3(0.89, 0.91, 0.27), // 17Grad Yellow
    vec3(0.278, 0.278, 0.0), // 17Grad Blue 0.9
     fragCoord.x * 4.0 - 1.65 // color split not in middle but slightly off
    );
    if (mask.b == mask.r) {
        opacity = max(fadeOutProgress,0.);
    }
    gl_FragColor = vec4(color, opacity);
}