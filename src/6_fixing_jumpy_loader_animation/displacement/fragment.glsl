// already defined with ShaderMaterial
// precision mediump float;

// we did receive this from vertex shader, because we did send it (not done by ShaderMaterial)
varying vec2 vUv;

// this is uniform we mentioned (mandatory (explained why))
uniform sampler2D tDiffuse;

// uniform float uTime;

uniform sampler2D uNormalMap;  // our texture


void main() {

  
  // this is mandatory (consider this hello world fragment shader
  //  code for passes)
  // ------------------------------------------------------------
  // vec2 newUv = vUv;
  // vec4 color = texture2D(tDiffuse, newUv);
  // gl_FragColor = color;
  // ------------------------------------------------------------ 
  // testing if textue is working
  // vec4 mytexture = texture2D(uNormalMap, vUv);
  // gl_FragColor = mytexture;
  // ------------------------------------------------------------
  
  // it looks cool
  // vec3 normalColor = texture2D(uNormalMap, vUv).xyz * 2.0 - 1.0;
  // vec2 newUv = vUv + normalColor.xy * 0.1;
  // vec4 color = texture2D(tDiffuse, newUv);
  // 
  // gl_FragColor = color;
  // ------------------------------------------------------------
  // improved
  
  vec3 normalColor = texture2D(uNormalMap, vUv).xyz * 2.0 - 1.0;
  vec2 newUv = vUv + normalColor.xy * 0.1;
  vec4 color = texture2D(tDiffuse, newUv);
  
  vec3 lightingDirection = normalize(vec3(-1.0, 1.0, 0.0));
  float lightness = clamp(dot(normalColor, lightingDirection), 0.0, 1.0);
  
  // gl_FragColor = vec4(vec3(lightness), 1.0);

  color += lightness * 2.0;



  gl_FragColor = color;



  // gl_FragColor = vec4(vec3(strength, strength, strength), 1.0);
}