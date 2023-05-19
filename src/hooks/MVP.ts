import { mat4, vec3 } from "gl-matrix";
const MVP = (
  position: { x: number; y: number; z: number },
  scale: { x: number; y: number; z: number },
  rotation: { x: number; y: number; z: number },
  canvasWH: { width: number; height: number }
) => {
  //get modelView Matrix
  const modelViewMatrix = mat4.create();
  mat4.translate(
    modelViewMatrix,
    modelViewMatrix,
    vec3.fromValues(position.x, position.y, position.z)
  );
  // rotate
  mat4.rotateX(modelViewMatrix, modelViewMatrix, rotation.x);
  mat4.rotateY(modelViewMatrix, modelViewMatrix, rotation.y);
  mat4.rotateZ(modelViewMatrix, modelViewMatrix, rotation.z);
  // scale
  mat4.scale(
    modelViewMatrix,
    modelViewMatrix,
    vec3.fromValues(scale.x, scale.y, scale.z)
  );

  //get projection Matrix
  const projectionMatrix = mat4.create();
  mat4.perspective(
    projectionMatrix,
    (60 / 180) * Math.PI,
    canvasWH.width / canvasWH.height,
    0.1,
    100
  );

  //get mvp Matrix
  const mvpMatrix = mat4.create();
  mat4.multiply(mvpMatrix, projectionMatrix, modelViewMatrix);
  return mvpMatrix;
};
export default MVP;
