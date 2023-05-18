<template>
    <div>
        <canvas width="480" height="240" id="webgpucanvas"></canvas>
    </div>
</template>

<script setup lang="ts">
import useWebgpu from "../hooks/useWebgpu";
import vert from '@/shaders/triangle.vert.wgsl?raw'
import frag from '@/shaders/red.frag.wgsl?raw'
import { onMounted} from 'vue';
onMounted(async () => {
    let canvas = document.getElementById("webgpucanvas") as HTMLCanvasElement
    const { context, device } = await useWebgpu(canvas);
    //配置canvas上下文
    const canvsConfig: GPUCanvasConfiguration = {
        device,
        format: navigator.gpu.getPreferredCanvasFormat(),
        alphaMode: "premultiplied",  
    }
    context?.configure(canvsConfig)
    // //创建渲染管线
    const pipeline = device.createRenderPipeline({
        vertex: {
            module: device.createShaderModule({
                code: vert,
            }),
            entryPoint: 'main',
        },
        fragment: {
            module: device.createShaderModule({
                code: frag,
            }),
            entryPoint: 'main',
            targets: [
                {
                    format: navigator.gpu.getPreferredCanvasFormat(),
                },
            ],
        },
        primitive: {
            topology: 'triangle-list',
        },
        layout: 'auto',
        multisample:{  //用于描述渲染过程中如何与多采样附件进行交互
            count:4  //表示每个像素采用数量，仅与具有sampleCuunt纹理的colorAttachments和depthStencilAttachments附件进行交互
        }
    });
    draw(device, context!, pipeline,canvas)
})
const draw = (device: GPUDevice, context: GPUCanvasContext, pipeline: GPURenderPipeline,canvas:HTMLCanvasElement) => {
    const commandEncoder = device.createCommandEncoder();
    //多采样纹理
    const MSAATexture = device.createTexture({
        size:[canvas.width,canvas.height],
        format:navigator.gpu.getPreferredCanvasFormat(),
        usage:GPUTextureUsage.RENDER_ATTACHMENT,
        sampleCount:4
    })
    const renderPassDescriptor: GPURenderPassDescriptor = {
        colorAttachments: [{
            view:MSAATexture.createView(),
            resolveTarget: context.getCurrentTexture().createView(),
            clearValue: { r: 0, g: 0, b: 0, a: 1 },
            loadOp: 'clear',
            storeOp: 'store'

        }]
    }
    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor)
    passEncoder.setPipeline(pipeline)
    passEncoder.draw(3, 1, 0, 0)
    passEncoder.end()
    device.queue.submit([commandEncoder.finish()])
}
</script>

<style lang="scss" scoped></style>