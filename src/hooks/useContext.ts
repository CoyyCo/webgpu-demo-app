const useContext = (device: any, canvas: HTMLCanvasElement,context: any,option?:any) => {
  const devicePixelRatio = window.devicePixelRatio || 1;
  canvas.height = canvas.height * devicePixelRatio;
  canvas.width = canvas.width * devicePixelRatio;
  const size = { width: canvas.width, height: canvas.height };
  context!.configure({
    device,
    format: navigator.gpu.getPreferredCanvasFormat(),
    alphaMode: "opaque",
  });
  return {size}
};
export default useContext;
