// already declared with ShaderMaterial
// uniform mat4 projectionMatrix;
// uniform mat4 viewMatrix;
// uniform mat4 modelMatrix;

 
// already declared with ShaderMaterial
// attribute vec2 uv;

// we still need to pass this by ourself
varying vec2 vUv;
//

// already declared with ShaderMaterial
// attribute vec3 position;



void main(){

  // ok, we were using this all the time in earlier project
  // but now we want for shader to be all the time in
  // in front of the camera
  // so we don't need to use it
  // vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  // vec4 viewPosition = viewMatrix * modelPosition;
  // vec4 projectedPosition = projectionMatrix * viewPosition;


  // we can just write this
  gl_Position = vec4(position, 1.0); // this way shader will be in front of the camera

  // why is this happening
  // well because we are not using all the transformations
  // we are just using position and as you know shader is
  // made just to draw triangles on the screen
  // so without any other transformation
  // it will be positioned in the middle of the clip space

  // but why plane isn't covering the whole screen
  // since his width, height is 1
  // which means it will go from -0.5 to 0.5

  // and clip space goes from -1 to 1

  // --------------------------------------------------------



  
  // gl_Position = projectedPosition;

  vUv = uv;
}