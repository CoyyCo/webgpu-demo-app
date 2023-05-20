import { cube } from "../datas/cube";
const useBuffer = (device: GPUDevice) => {
  const vertexBuffer = device.createBuffer({
    label: "GPUBuffer store vertex",
    size: cube.data.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(vertexBuffer, 0, cube.data);
  return { vertexBuffer };
};
export default useBuffer;
