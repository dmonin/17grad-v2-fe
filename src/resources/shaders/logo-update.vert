#version 300 es
precision mediump float;

#define M_PI 3.1415926535897932384626433832795

uniform float u_TimeDelta;
uniform vec2 u_MousePos;
uniform float u_Speed;
uniform float u_Mode;
uniform float u_Boost;
uniform float u_BoostThreshold;
uniform float u_CircleSize;

uniform vec2 u_LeftTriangleA;
uniform vec2 u_LeftTriangleB;
uniform vec2 u_LeftTriangleC;

uniform vec2 u_RightTriangleA;
uniform vec2 u_RightTriangleB;
uniform vec2 u_RightTriangleC;

in vec2 i_Position;
in vec2 i_Velocity;
in vec2 i_Acceleration;
in vec2 i_Gravity;
in float i_Friction;

in vec4 i_LogoPos;
in vec2 i_CorePos;
in vec2 i_WorkPos;
in vec2 i_PlayPos;

out vec2 v_Position;
out vec2 v_Velocity;
out vec2 v_Acceleration;
out vec2 v_Gravity;
out float v_Friction;

out vec4 v_LogoPos;
out vec2 v_CorePos;
out vec2 v_WorkPos;
out vec2 v_PlayPos;

vec2 randVec(float co) {
  return vec2(
    fract(sin(dot(vec2(co, co), vec2(12.9898,78.233))) * 43758.5453),
    fract(sin(dot(vec2(co, co) * u_TimeDelta, vec2(12.9898,78.233))) * 43758.5453)
  );
}

bool ptInTriangle(vec2 p, vec2 p0, vec2 p1, vec2 p2) {
  float dX = p.x-p2.x;
  float dY = p.y-p2.y;
  float dX21 = p2.x-p1.x;
  float dY12 = p1.y-p2.y;
  float D = dY12*(p0.x-p2.x) + dX21*(p0.y-p2.y);
  float s = dY12*dX + dX21*dY;
  float t = (p2.y-p0.y)*dX + (p0.x-p2.x)*dY;
  if (D<0.0) return s<=0.0 && t<=0.0 && s+t>=D;
  return s>=0.0 && t>=0.0 && s+t<=D;
}

vec2 randTrianglePos(float scale) {
  // Left triangle
  vec2 A1 = u_LeftTriangleA * scale;
  vec2 B1 = u_LeftTriangleB * scale;
  vec2 C1 = u_LeftTriangleC * scale;
  vec2 center1 = (A1 + B1 + C1) / 3.0;

  // Right triangle
  vec2 A2 = u_RightTriangleA * scale;
  vec2 B2 = u_RightTriangleB * scale;
  vec2 C2 = u_RightTriangleC * scale;
  vec2 center2 = (A2 + B2 + C2) / 3.0;

  vec2 target;
  if (i_LogoPos.z > 0.5) {

    target = (1.0 - sqrt(i_LogoPos.x)) *
      A1 + (sqrt(i_LogoPos.x) * (1.0 - i_LogoPos.y)) *
      B1 + (sqrt(i_LogoPos.x) * i_LogoPos.y) * C1;

    float distanceToCenter = distance(center1, target);
    float randDesc = randVec(i_LogoPos.x * i_LogoPos.y).x;

    if (randDesc > 0.6) {
      vec2 forceToUpperEdge = B1 - target;
      target += forceToUpperEdge * (distanceToCenter * 0.7);
    } else if (randDesc > 0.2) {
      vec2 forceToUpperEdge = A1 - target;
      target += forceToUpperEdge * (distanceToCenter * 0.7);
    }

  } else {

    target = (1.0 - sqrt(i_LogoPos.x)) * A2 +
      (sqrt(i_LogoPos.x) * (1.0 - i_LogoPos.y)) * B2 +
      (sqrt(i_LogoPos.x) * i_LogoPos.y) * C2;

    float distanceToCenter = distance(center2, target);
    float randDesc = randVec(i_LogoPos.x * i_LogoPos.y).x;

    if (randDesc > 0.6) {
      vec2 forceToUpperEdge = A2 - target;
      target += forceToUpperEdge * (distanceToCenter * 0.7);
    } else if (randDesc > 0.2) {
      vec2 forceToUpperEdge = B2 - target;
      target += forceToUpperEdge * (distanceToCenter * 0.7);
    }
  }

  return target;
}

void main() {
  vec2 A1 = u_LeftTriangleA;
  vec2 B1 = u_LeftTriangleB;
  vec2 C1 = u_LeftTriangleC;
  vec2 A2 = u_RightTriangleA;
  vec2 B2 = u_RightTriangleB;
  vec2 C2 = u_RightTriangleC;

  vec2 position = i_Position;
  vec2 velocity = i_Velocity;
  vec2 acceleration = i_Acceleration;
  vec2 gravity = i_Gravity;

  if (u_Mode == 1.0) {
    gravity = i_CorePos;
  } else if (u_Mode == 2.0) {
    gravity = i_WorkPos;
  } else if (u_Mode == 3.0) {
    gravity = i_PlayPos;
  } else {
    // Zoom on mouse in
    if (ptInTriangle(u_MousePos, A1, B1, C1) && i_LogoPos.z > 0.5) {
      gravity = randTrianglePos(1.2);
    } else if (ptInTriangle(u_MousePos, A2, B2, C2) && i_LogoPos.z <= 0.5) {
      gravity = randTrianglePos(1.2);
    } else {
      gravity = randTrianglePos(1.0); // Save in vector to avoid recomputation
    }
  }

  vec2 gravityForce = gravity - position;
  if (distance(u_MousePos, position) < u_CircleSize) {
    gravityForce = (position - u_MousePos);
  }

  acceleration = acceleration * i_Friction;
  velocity = (velocity + acceleration) * i_Friction + gravityForce;

  if (length(velocity) < u_BoostThreshold) {
    // new boost when velo to low
    acceleration = randVec(position.x * position.y) * u_Boost;
  }

  float speed = u_Speed * u_TimeDelta;
  position = position + (velocity * speed);

  v_Position = position;
  v_Velocity = velocity;
  v_Acceleration = acceleration;
  v_Gravity = gravity;
  v_Friction = i_Friction;

  v_LogoPos = i_LogoPos;
  v_CorePos = i_CorePos;
  v_WorkPos = i_WorkPos;
  v_PlayPos = i_PlayPos;
}
