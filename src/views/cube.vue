<template>
    <div>
        <canvas width="480" height="240" id="webgpucanvas"></canvas>
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
            depthCompare:"less",
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
    const position = { x: 0, y: 0, z: -5 }
    const scale = { x: 1, y: 1, z: 1 }
    const rotation = { x: 1, y: 1, z: 0 }
    //get modelView Matrix
    const modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix,modelViewMatrix,vec3.fromValues(position.x, position.y, position.z))
    // rotate
    mat4.rotateX(modelViewMatrix, modelViewMatrix, rotation.x)
    mat4.rotateY(modelViewMatrix, modelViewMatrix, rotation.y)
    mat4.rotateZ(modelViewMatrix, modelViewMatrix, rotation.z)
    // scale
    mat4.scale(modelViewMatrix, modelViewMatrix, vec3.fromValues(scale.x, scale.y, scale.z))

    //get projection Matrix
    const projectionMatrix = mat4.create()
    mat4.perspective(projectionMatrix,60 / 180 * Math.PI,canvas.width/canvas.height,0.1,100)

    //get mvp Matrix
    const mvpMatrix = mat4.create()
    mat4.multiply(mvpMatrix,projectionMatrix,modelViewMatrix)
    device.queue.writeBuffer(mvpBuffer,0,mvpMatrix as Float32Array)


    //深度材质
    const depthTexture = device.createTexture({
        size:[canvas.width,canvas.height],
        format:"depth24plus",
        usage:GPUTextureUsage.RENDER_ATTACHMENT
    })
    const commandEncoder = device.createCommandEncoder()
    const passEncoder = commandEncoder.beginRenderPass({
        colorAttachments: [{
            view: context!.getCurrentTexture().createView(),
            clearValue: { r: 0, g: 0, b: 0, a: 1 },
            loadOp: 'clear',
            storeOp: 'store'
        }],
        depthStencilAttachment:{
            view:depthTexture.createView(),
            depthClearValue:1.0,
            depthLoadOp:"clear",
            depthStoreOp:'store'
        }
    })
    passEncoder.setPipeline(pipeline)
    passEncoder.setVertexBuffer(0, vertexBuffer)
    passEncoder.setBindGroup(0, uniformGroup)
    passEncoder.draw(cube.len)
    passEncoder.end()
    device.queue.submit([commandEncoder.finish()])
})
</script>

<style scoped lang="scss"></style>