uniform vec3 uMin;
uniform vec3 uMax;

#define PI 3.141592653589793

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

vec3 displace(vec3 pos) {
  vec3 result = pos;
  float theta = map(pos.x, uMin.x - 0.3, uMax.x + 0.3, -PI, PI);
  vec3 dir = vec3(sin(theta), 0.0, cos(theta));
  result = 2.0 * dir + vec3(0, pos.y, 0) + dir * pos.z;
  return result;
}

#include '../glsl/recalcNormal.glsl'

#include <common>