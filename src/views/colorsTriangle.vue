<template>
    <div>
        <canvas width="480" height="240" id="webgpucanvas"></canvas>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import useWebgpu from '../hooks/useWebgpu';
import vert from '@/shaders/colorsTriangle.vert.wgsl?raw'
import frag from '@/shaders/colorsTriangle.frag.wgsl?raw'
onMounted(async () => {
    let canvas = document.getElementById('webgpucanvas') as HTMLCanvasElement
    const { context, device } = await useWebgpu(canvas);
    context?.configure({
        device,
        format: navigator.gpu.getPreferredCanvasFormat(),
        alphaMode: "opaque"
    })
    //前三个表示坐标，后三个表示颜色
    const vertexArray = new Float32Array([
        0.0, 0.5, 0.0, 1.0, 0.0, 0.0, //红色
        -0.5, -0.5, 0.0, 0.0, 1.0, 0.0, //绿色
        0.5, -0.5, 0.0, 0.0, 0.0, 1.0 //蓝色
    ])
    const vertexbuffer = device.createBuffer({
        size: vertexArray.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    })
    device.queue.writeBuffer(vertexbuffer, 0, vertexArray)
    const pipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: {
            entryPoint: "main",
            module: device.createShaderModule({
                code: vert
            }),
            buffers: [
                {
                    arrayStride: 6 * 4,
                    attributes: [
                        {
                            shaderLocation: 0,
                            offset: 0,
                            format: "float32x3"
                        },
                        {
                            shaderLocation: 1,
                            offset: 3 * 4,
                            format: "float32x3"
                        }
                    ]
                }
            ]
        },
        fragment: {
            entryPoint: "main",
            module: device.createShaderModule({
                code: frag
            }),
            targets: [
                {
                    format: navigator.gpu.getPreferredCanvasFormat()
                }
            ]
        },
        primitive: {
            topology: "triangle-list"
        }
    })

    //渲染通道编码器
    const commandEncoder = device.createCommandEncoder()
    const passEncoder = commandEncoder.beginRenderPass({
        colorAttachments: [{
            view: context!.getCurrentTexture().createView(),
            clearValue: { r: 0, g: 0, b: 0, a: 1 },
            loadOp: 'clear',
            storeOp: 'store'
        }]
    })
    passEncoder.setPipeline(pipeline)
    passEncoder.setVertexBuffer(0,vertexbuffer)
    passEncoder.draw(3, 1, 0, 0)
    passEncoder.end()
    device.queue.submit([commandEncoder.finish()])
})
</script>

<style lang="scss" scoped></style>