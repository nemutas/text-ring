varying vec2 vScreenUv;
varying vec3 vNormal;
varying vec3 vEye;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vEye = normalize((modelViewMatrix * vec4( position, 1.0 )).xyz);

  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  vScreenUv = gl_Position.xy / gl_Position.w * 0.5 + 0.5;
}