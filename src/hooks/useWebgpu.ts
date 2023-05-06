const useWebgpu = async (canvas: HTMLCanvasElement | undefined) => {    
  //获取显卡适配器
  const adapter: GPUAdapter | null = await navigator.gpu.requestAdapter();
  //获取显卡设备
  const device = await adapter!.requestDevice();
  //获取canvas上下文
  const context = canvas!.getContext("webgpu");
  return {
    context,
    adapter,
    device,
  };
};
export default useWebgpu;
