precision highp float;

varying vec2 vUv;
uniform sampler2D tMap;
uniform sampler2D tDisplacement;
uniform float uProgress;
uniform vec2 mousePos;


vec4 yellow = vec4(228.,234.,69.,1.);
vec4 blue = vec4(71.,71.,222.,1.);

float blueDistortion = 0.75;
float yellowDistortion = 0.375;

vec4 normColor(vec4 color){
    return vec4(color.r / 256., color.g / 256.,color.b / 256.,1.);
}

vec4 multiply(vec4 current, vec4 overlay){
    return current * overlay;
}

vec4 multiplyNegative(vec4 current, vec4 color){
    return vec4(1.) - ((vec4(1.) - current)*(vec4(1.) - color));
}

float manhattenNorm(vec4 v){
    return v.x + v.y + v.z;
}

/*
* This function displaces the coordinates moving in a sine_wave towards -x
* (from right to left)
*/
vec2 displFct(vec2 vUv, vec4 displacementMap, float strength, bool inverted){
    float displacementValue = manhattenNorm(displacementMap);
    float xLimit = 0.1; //change for stronger x separation and more linear distortion
    float yLimit = 0.2; //functions works best with this y limit, don't change
    float signum = 1.; // either + or -1.    
    float progress = uProgress;
    if(inverted){
        signum = -1.;
        progress = 1. - uProgress;
    }
    float direction = progress * yLimit;
    if (direction > yLimit/2.) {
            direction = yLimit*(1. - progress);
    }
    float xComputation = vUv.x + signum * displacementValue * strength * uProgress * xLimit;
    float yComputation = signum * sin(vUv.y * direction * strength) * vUv.y + vUv.y;
        
    return vec2(xComputation, yComputation);
}


void main()	{
    vec2 mouse = vec2(0.5, 0.5);
    vec4 image = texture2D(tMap, vUv);
    vec4 dispMap = texture2D(tDisplacement, vUv);

    //start situation
    vec4 blueMap = texture2D(tMap, displFct(vUv, dispMap, blueDistortion, false));
    vec4 yellowMap = texture2D(tMap, displFct(vUv, dispMap, yellowDistortion, false));
    vec4 blueOverlay = multiplyNegative(blueMap,normColor(blue));
    vec4 yellowOverlay = multiplyNegative(yellowMap, normColor(yellow));
    vec4 grayOverlay = multiply(blueOverlay,yellowOverlay);

    //end situation
    vec2 blueShift = vec2(vUv.x + 0.5, vUv.y);
    vec2 yellowShift = vec2(vUv.x + 0.2, vUv.y);
    vec4 goalBlueMap = texture2D(tMap, displFct(blueShift,dispMap,blueDistortion, true));
    vec4 goalYellowMap = texture2D(tMap, displFct(yellowShift,dispMap,yellowDistortion, true));
    vec4 goalBlueOverlay = multiplyNegative(goalBlueMap,normColor(blue));
    vec4 goalYellowOverlay = multiplyNegative(goalYellowMap, normColor(yellow));
    vec4 goalGray = multiply(goalBlueOverlay, goalYellowOverlay);
    vec4 result = mix(goalGray, grayOverlay,0.9);

    gl_FragColor = result;
}
