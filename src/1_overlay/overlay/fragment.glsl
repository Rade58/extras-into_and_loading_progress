// already defined with ShaderMaterial
// precision mediump float;

// we did receive this from vertex shader, because we did send it (not done by ShaderMaterial)
varying vec2 vUv;




void main() {

  
  
  gl_FragColor = vec4(vUv, 0.0, 1.0);

}