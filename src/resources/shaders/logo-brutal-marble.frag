#version 100
#define M_PI 3.1415926535897932384626433832795
precision mediump float;

varying vec2 vTextureCoord;

uniform float iTime;
uniform bool uHasTexure;
uniform sampler2D uSampler;

vec2 cmul( vec2 a, vec2 b )  { return vec2( a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x ); }
vec2 csqr( vec2 a )  { return vec2( a.x*a.x - a.y*a.y, 2.*a.x*a.y  ); }

vec2 iSphere( in vec3 ro, in vec3 rd, in vec4 sph )//from iq
{
  vec3 oc = ro - sph.xyz;
  float b = dot( oc, rd );
  float c = dot( oc, oc ) - sph.w*sph.w;
  float h = b*b - c;
  if( h<0.0 ) return vec2(-1.0);
  h = sqrt(h);
  return vec2(-b-h, -b+h );
}

float map(in vec3 p) {

  float res = 0.;

    vec3 c = p;
  for (int i = 0; i < 10; ++i) {
        p =.7*abs(p)/dot(p,p) -.7;
        p.yz= csqr(p.yz);
        p=p.zxy;
        res += exp(-19. * abs(dot(p,c)));

  }
  return res/2.;
}

vec3 raymarch( in vec3 ro, vec3 rd, vec2 tminmax )
{
    float t = tminmax.x;
    float dt = .02;
    //float dt = .2 - .195*cos(iTime*.05);
    vec3 col= vec3(0.);
    float c = 0.;
    for( int i=0; i<64; i++ )
  {
        t+=dt*exp(-2.*c);
        if(t>tminmax.y)break;
        vec3 pos = ro+t*rd;

        c = map(ro+t*rd);

        //col = .99*col+ .08*vec3(c*c, c, c*c*c);//green
        col = .99*col+ .08*vec3(c*c*c, c*c, c);//blue
    }
    return col;
}

mat2 rot(float a) {
	return mat2(cos(a),sin(a),-sin(a),cos(a));
}

void main(void) {
  float time = iTime / 1000.0;
  vec2 iResolution = vec2(800.0, 800.0); // Make Uniform
  vec2 q = vTextureCoord;
  vec2 p = -1.0 + 2.0 * q;
  p.x *= iResolution.x/iResolution.y;
  vec2 m = vec2(-.5);

  vec3 ro = vec3(4.);
  ro.yz*=rot(m.y);
  ro.xz*=rot(m.x+ 0.1*time);
  vec3 ta = vec3( 0.0 , 0.0, 0.0 );
  vec3 ww = normalize( ta - ro );
  vec3 uu = normalize( cross(ww,vec3(0.0,1.0,0.0) ) );
  vec3 vv = normalize( cross(uu,ww));
  vec3 rd = normalize( p.x*uu + p.y*vv + 4.0*ww );

  vec2 tmm = iSphere( ro, rd, vec4(0.,0.,0.,2.) );

  vec3 col = raymarch(ro,rd,tmm);
  col =  .5 *(log(1.+col));
  col = clamp(col,0.,1.);

  gl_FragColor = vec4(col, 1.0);
}
