<template>
    <div>
        <canvas width="500" height="300" id="webgpucanvas"></canvas>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import useWebgpu from '../hooks/useWebgpu';
import { cube } from "../datas/cube"
import MVP from '../hooks/MVP';
import vert from "@/shaders/cube.vert.wgsl?raw"
import frag from "@/shaders/cube.frag.wgsl?raw"
import vertT from '@/shaders/colorsTriangle.vert.wgsl?raw'
import fragT from '@/shaders/colorsTriangle.frag.wgsl?raw'
onMounted(async () => {
    let canvas = document.getElementById('webgpucanvas') as HTMLCanvasElement
    const devicePixelRatio = window.devicePixelRatio || 1
    canvas.height = canvas.height*devicePixelRatio
    canvas.width = canvas.width*devicePixelRatio
    const canvasWH = {width: canvas.width, height:canvas.height}
    
    const { device, context } = await useWebgpu(canvas)
    context!.configure({
        device,
        format: navigator.gpu.getPreferredCanvasFormat(),
        alphaMode: "opaque",
    })
    const vertexBuffer = device.createBuffer({
        label: 'GPUBuffer store vertex',
        size: cube.data.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    })
    device.queue.writeBuffer(vertexBuffer, 0, cube.data)
    const pipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: {
            module: device.createShaderModule({
                code: vert
            }),
            entryPoint: "main",
            buffers: [{
                arrayStride: 3 * 4,
                attributes: [
                    {
                        shaderLocation: 0,
                        offset: 0,
                        format: "float32x3"
                    }
                ]
            }]
        },
        fragment: {
            module: device.createShaderModule({
                code: frag
            }),
            targets: [{
                format: navigator.gpu.getPreferredCanvasFormat()
            }],
            entryPoint: "main"
        },
        primitive: {
            topology: 'triangle-list',
            // Culling backfaces pointing away from the camera
            cullMode: 'back',
            frontFace: 'ccw'
        },
        depthStencil: {  //开启深度测试
            depthWriteEnabled: true,
            depthCompare: "less",
            format: 'depth24plus',
        },
        multisample: {  //用于描述渲染过程中如何与多采样附件进行交互
            count: 4  //表示每个像素采用数量，仅与具有sampleCuunt纹理的colorAttachments和depthStencilAttachments附件进行交互
        }
    })
    const mvpBuffer = device.createBuffer({
        label: "mvp matrix buffer 4*4",
        size: 4 * 4 * 4, // 4 x 4 x float32
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })
    const uniformGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: mvpBuffer
                }
            }
        ]
    })
    //getmvp矩阵
    const position = { x: 10, y: 0, z: -15 }
    const scale = { x: 1, y: 1, z: 1 }
    const rotation = { x: 1, y: 1, z: 0 }
    const mvpMatrix = MVP(position, scale, rotation, canvasWH)
    device.queue.writeBuffer(mvpBuffer, 0, mvpMatrix as Float32Array)

    //绘制三角形
    //前三个表示坐标，后三个表示颜色
    const vertexArray = new Float32Array([
        0.0, 0.5, 0.0, 1.0, 0.0, 0.0, //红色
        -0.5, -0.5, 0.0, 0.0, 1.0, 0.0, //绿色
        0.5, -0.5, 0.0, 0.0, 0.0, 1.0 //蓝色
    ])
    const vertexbufferT = device.createBuffer({
        size: vertexArray.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    })
    device.queue.writeBuffer(vertexbufferT, 0, vertexArray)
    const pipelineTriangle = device.createRenderPipeline({
        layout: "auto",
        vertex: {
            entryPoint: "main",
            module: device.createShaderModule({
                code: vertT
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
                code: fragT
            }),
            targets: [
                {
                    format: navigator.gpu.getPreferredCanvasFormat()
                }
            ]
        },
        primitive: {
            topology: "triangle-list"
        },
        depthStencil: {  //开启深度测试
            depthWriteEnabled: true,
            depthCompare: "less",
            format: 'depth24plus',
        },
        multisample: {  //用于描述渲染过程中如何与多采样附件进行交互
            count: 4  //表示每个像素采用数量，仅与具有sampleCuunt纹理的colorAttachments和depthStencilAttachments附件进行交互
        }
    })
    //深度材质
    const depthTexture = device.createTexture({
        size: [canvasWH.width, canvasWH.height],
        format: "depth24plus",
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
        sampleCount:4
    })
    const commandEncoder = device.createCommandEncoder()
    //多采样纹理
    const MSAATexture = device.createTexture({
        size: [canvasWH.width, canvasWH.height],
        format: navigator.gpu.getPreferredCanvasFormat(),
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
        sampleCount: 4
    })
    const passEncoder = commandEncoder.beginRenderPass({
        colorAttachments: [{
            resolveTarget:context!.getCurrentTexture().createView(),
            view: MSAATexture.createView(),
            clearValue: { r: 0, g: 0, b: 0, a: 1 },
            loadOp: 'clear',
            storeOp: 'store',
        }],
        depthStencilAttachment: {
            view: depthTexture.createView(),
            depthClearValue: 1.0,
            depthLoadOp: "clear",
            depthStoreOp: 'store'
        }
    })
    passEncoder.setPipeline(pipeline)
    passEncoder.setVertexBuffer(0, vertexBuffer)
    passEncoder.setBindGroup(0, uniformGroup)
    passEncoder.draw(cube.len)
    passEncoder.setPipeline(pipelineTriangle)
    passEncoder.setVertexBuffer(0, vertexbufferT)
    passEncoder.draw(3)
    passEncoder.end()
    device.queue.submit([commandEncoder.finish()])
})
</script>

<style scoped lang="scss"></style>