// already defined with ShaderMaterial
// precision mediump float;

// we did receive this from vertex shader, because we did send it (not done by ShaderMaterial)
varying vec2 vUv;

// this is uniform we mentioned (mandatory (explained why))
uniform sampler2D tDiffuse;

// additional uniform we added
uniform vec3 uTint;


void main() {

  
  // you can use round because it is available only when using ShaderMaterial
  // not available when using RawShaderMaterial
  // float strength = round(vUv.x * 10.0) / 10.0;
  // float strength = vUv.x;

  vec4 color = texture2D(tDiffuse, vUv);

  // color.r += 0.1;
  // color.b += 0.2 ;

  // color = mix(color, vec4(uTint, 0.1), 0.2);

  color.rgb += uTint;



  // gl_FragColor = vec4(vec3(strength, strength, strength), 1.0);
  // gl_FragColor = vec4(color);
  gl_FragColor = color;

}