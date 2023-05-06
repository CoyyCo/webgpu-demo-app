<template>
    <div>
        <!-- afdsf -->
        <canvas width="600" height="480" id="webgpucanvas"></canvas>
    </div>
</template>

<script setup lang="ts">
import useWebgpu from "../hooks/useWebgpu";
import { onMounted } from 'vue';
const str = `
@vertex
fn main(@builtin(vertex_index) VertexIndex: u32) -> @builtin(position) vec4<f32> {
    var pos = array<vec2<f32>, 3>(
        vec2<f32>(0.0, 0.5),
        vec2<f32>(-0.5, -0.5),
        vec2<f32>(0.5, -0.5)
    );

    return vec4<f32>(pos[VertexIndex], 0.0, 1.0);
}
`
const str2 = `
@fragment
fn main() -> @location(0) vec4<f32> {
    return vec4<f32>(1.0, 0.0, 0.0, 1.0);
}
`
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
                code: str,
            }),
            entryPoint: 'main',
        },
        fragment: {
            module: device.createShaderModule({
                code: str2,
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
        layout: 'auto'
    });
    draw(device, context!, pipeline)
})
const draw = (device: GPUDevice, context: GPUCanvasContext, pipeline: GPURenderPipeline) => {
    const commandEncoder = device.createCommandEncoder();
    const renderPassDescriptor: GPURenderPassDescriptor = {
        colorAttachments: [{
            view: context.getCurrentTexture().createView(),
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