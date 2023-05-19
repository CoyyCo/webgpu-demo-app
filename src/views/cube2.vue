<template>
    <div>
        <canvas width="1080" height="680" id="webgpucanvas"></canvas>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import useWebgpu from '../hooks/useWebgpu';
import { cube } from "../datas/cube"
import vert from "@/shaders/cube.vert.wgsl?raw"
import frag from "@/shaders/cube.frag.wgsl?raw"
import { mat4, vec3 } from 'gl-matrix'
onMounted(async () => {
    let canvas = document.getElementById('webgpucanvas') as HTMLCanvasElement
    const { device, context } = await useWebgpu(canvas)
    context!.configure({
        device,
        format: navigator.gpu.getPreferredCanvasFormat(),
        alphaMode: "opaque"
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
    //get modelView Matrix
    const modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, vec3.fromValues(position.x, position.y, position.z))
    // rotate
    mat4.rotateX(modelViewMatrix, modelViewMatrix, rotation.x)
    mat4.rotateY(modelViewMatrix, modelViewMatrix, rotation.y)
    mat4.rotateZ(modelViewMatrix, modelViewMatrix, rotation.z)
    // scale
    mat4.scale(modelViewMatrix, modelViewMatrix, vec3.fromValues(scale.x, scale.y, scale.z))

    //get projection Matrix
    const projectionMatrix = mat4.create()
    mat4.perspective(projectionMatrix, 60 / 180 * Math.PI, canvas.width / canvas.height, 0.1, 100)

    //get mvp Matrix
    const mvpMatrix = mat4.create()
    mat4.multiply(mvpMatrix, projectionMatrix, modelViewMatrix)
    device.queue.writeBuffer(mvpBuffer, 0, mvpMatrix as Float32Array)

    const mvpBuffer2 = device.createBuffer({
        label: "mvp matrix buffer 4*4",
        size: 4 * 4 * 4, // 4 x 4 x float32
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })
    const uniformGroup2 = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: mvpBuffer2
                }
            }
        ]
    })
    //getmvp矩阵
    const position2 = { x: 0, y: 0, z: -15 }
    const scale2 = { x: 0.5, y: 0.5, z: 0.5 }
    const rotation2 = { x: 1, y: 1, z: 0 }
    //get modelView Matrix
    const modelViewMatrix2 = mat4.create();
    mat4.translate(modelViewMatrix2, modelViewMatrix2, vec3.fromValues(position2.x, position2.y, position2.z))
    // rotate
    mat4.rotateX(modelViewMatrix2, modelViewMatrix2, rotation2.x)
    mat4.rotateY(modelViewMatrix2, modelViewMatrix2, rotation2.y)
    mat4.rotateZ(modelViewMatrix2, modelViewMatrix2, rotation2.z)
    // scale
    mat4.scale(modelViewMatrix2, modelViewMatrix2, vec3.fromValues(scale2.x, scale2.y, scale2.z))

    //get projection Matrix
    const projectionMatrix2 = mat4.create()
    mat4.perspective(projectionMatrix2, 60 / 180 * Math.PI, canvas.width / canvas.height, 0.1, 100)

    //get mvp Matrix
    const mvpMatrix2 = mat4.create()
    mat4.multiply(mvpMatrix2, projectionMatrix2, modelViewMatrix2)
    device.queue.writeBuffer(mvpBuffer2, 0, mvpMatrix2 as Float32Array)
    //深度材质
    const depthTexture = device.createTexture({
        size: [canvas.width, canvas.height],
        format: "depth24plus",
        usage: GPUTextureUsage.RENDER_ATTACHMENT
    })
    const commandEncoder = device.createCommandEncoder()
    const passEncoder = commandEncoder.beginRenderPass({
        colorAttachments: [{
            view: context!.getCurrentTexture().createView(),
            clearValue: { r: 0, g: 0, b: 0, a: 1 },
            loadOp: 'clear',
            storeOp: 'store'
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
    passEncoder.setBindGroup(0, uniformGroup2)
    passEncoder.draw(cube.len)
    passEncoder.end()
    device.queue.submit([commandEncoder.finish()])
})
</script>

<style scoped lang="scss"></style>