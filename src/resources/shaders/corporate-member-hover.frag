precision highp float;

varying vec2 vUv;
uniform sampler2D tMapFrom;
uniform sampler2D tMapTo;
uniform sampler2D tDisplace;
uniform float uDisplacementFactor;
const float speedFactor = 0.15;

void main()	{
    
    vec4 displacement = texture2D(tDisplace, vUv);
    /* x distortion  */
    vec2 distortedPositionFrom = vec2(vUv.x + uDisplacementFactor* (displacement.r*speedFactor), vUv.y);
    vec2 distortedPositionTo = vec2(vUv.x - (1.0 - uDisplacementFactor) * (displacement.r*speedFactor), vUv.y);
    
    /* y distortion and also inverted direction
    vec2 distortedPositionFrom = vec2(vUv.x , vUv.y + uDisplacementFactor* (displacement.r*speedFactor));
    vec2 distortedPositionTo = vec2(vUv.x , vUv.y - (1.0 - uDisplacementFactor) * (displacement.r*speedFactor));
    */

    vec4 textureFrom = texture2D(tMapFrom, distortedPositionFrom);
    vec4 textureTo = texture2D(tMapTo, distortedPositionTo);

    vec4 finalTexture = mix(textureFrom, textureTo, uDisplacementFactor);

    gl_FragColor = finalTexture;//directionalWarp(vUv);

}