uniform sampler2D tText;
varying vec2 vScreenUv;
varying vec3 vNormal;
varying vec3 vEye;

const vec3 lightPos = vec3(1, 1, 1);

#include '../glsl/fresnel.glsl'

float specular(vec3 light, float shininess, float diffuseness) {
  vec3 lightVector = normalize(-light);
  vec3 halfVector = normalize(vEye + lightVector);

  float NdotL = dot(vNormal, lightVector);
  float NdotH =  dot(vNormal, halfVector);
  float kDiffuse = max(0.0, NdotL);
  float NdotH2 = NdotH * NdotH;

  float kSpecular = pow(NdotH2, shininess);
  return  kSpecular + kDiffuse * diffuseness;
}

void main() {
  vec3 distortion = refract(vEye, vNormal, 1.0 / 1.4);
  vec2 dist = distortion.xy * ( 1.0 - distortion.z * 0.85 );

  vec4  t = texture2D(tText, vScreenUv + (dist + 0.00) * 0.05);
  float g = texture2D(tText, vScreenUv + (dist + 0.01) * 0.05).g;
  float b = texture2D(tText, vScreenUv + (dist + 0.02) * 0.05).b;

  vec3 color = vec3(t.r, g, b);

  float light = specular(lightPos, 30.0, 0.5);
  color += light;

  float f = fresnel(vEye, vNormal);
  color -= f * 0.3;

  gl_FragColor = vec4(color, t.a);
}