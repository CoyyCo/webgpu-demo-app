<template>
    <div>
        <canvas width="600" height="480" id="webgpucanvas"></canvas>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import useWebgpu from '../hooks/useWebgpu';
import frag from '@/shaders/red.frag.wgsl?raw'
import vert from '@/shaders/dynamic.vert.wgsl?raw'
onMounted(async () => {
    let canvas = document.getElementById('webgpucanvas') as HTMLCanvasElement
    const { context, device } = await useWebgpu(canvas);
    //配置canvas上下文
    const canvsConfig: GPUCanvasConfiguration = {
        device,
        format: navigator.gpu.getPreferredCanvasFormat(),
        alphaMode: "premultiplied",
    }
    context?.configure(canvsConfig)
    //在JS中定义顶点坐标位置信息
    const vertexArray = new Float32Array([
        0.0, 1,
        -0.5, -0.5,
        0.5, -0.5
    ])
    const vertexbuffer = device.createBuffer({
        size: vertexArray.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    })
    device.queue.writeBuffer(vertexbuffer, 0, vertexArray)
    //创建渲染管线
    const pipeline = device.createRenderPipeline({
        vertex: {
            module: device.createShaderModule({
                code: vert,
            }),
            entryPoint: 'main',
            buffers: [{
                arrayStride: 2 * 4,//步幅，2个参数，每个参数4个字节
                attributes: [{
                    shaderLocation: 0,//表示对应wgsl中的第0个参数
                    offset: 0,//索引偏移
                    format: "float32x2"
                }]
            }]
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
        layout: 'auto'
    });
    //创建命令编码器
    const commandEncoder = device.createCommandEncoder()
    //创建渲染通道编码器
    const passEncoder = commandEncoder.beginRenderPass({
        colorAttachments: [{
            view: context!.getCurrentTexture().createView(),
            clearValue: { r: 0, g: 0, b: 0, a: 1 },
            loadOp: 'clear',
            storeOp: 'store'

        }]
    })
    passEncoder.setPipeline(pipeline)
    passEncoder.setVertexBuffer(0, vertexbuffer)
    passEncoder.draw(3, 1, 0, 0)
    passEncoder.end()
    device.queue.submit([commandEncoder.finish()])
})
</script>

<style scoped lang="scss"></style>