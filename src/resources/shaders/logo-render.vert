#version 300 es
precision mediump float;

in vec2 i_Position;
in vec2 i_Velocity;
in vec2 i_Gravity;

void main() {
  gl_PointSize = 1.0 + distance(i_Position, i_Gravity) * 2.0;
  gl_Position = vec4(i_Position, 0.0, 1.0);
}
