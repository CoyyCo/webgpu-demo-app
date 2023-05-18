<template>
    <div>
        <canvas width="480" height="240" id="webgpucanvas"></canvas>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import useWebgpu from '../hooks/useWebgpu';
import frag from '@/shaders/dynamic.frag.wgsl?raw'
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
    //在JS中定义颜色缓冲区
    const colorArray = new Float32Array([0.0, 1.0, 1.0, 1.0])
    const colorbuffer = device.createBuffer({
        size: colorArray.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })
    device.queue.writeBuffer(colorbuffer, 0, colorArray)
    //创建资源绑定组
    const bindGroup = device.createBindGroup({
        //布局，用于定位数据在显存的位置
        layout: pipeline.getBindGroupLayout(0), //获取索引为0的绑定组布局
        entries: [
            {
                binding: 1,
                resource: { buffer: colorbuffer }
            }
        ]
    })
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
    passEncoder.setBindGroup(0, bindGroup)
    passEncoder.draw(3)
    passEncoder.end()
    device.queue.submit([commandEncoder.finish()])
})
</script>

<style scoped lang="scss"></style>