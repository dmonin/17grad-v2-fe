precision highp float;

varying vec2 vUv;
uniform sampler2D tMap;

void main()	{

    vec4 picture = texture2D(tMap, vUv);

    gl_FragColor = picture;

}