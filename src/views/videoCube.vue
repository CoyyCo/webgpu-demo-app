<template>
    <div>
        <canvas width="500" height="300" id="webgpucanvas"></canvas>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import useWebgpu from '../hooks/useWebgpu';
import useContext from '../hooks/useContext';
import { cube } from '../datas/cube';
import basicVert from '../shaders/basic.vert.wgsl?raw'
import imageFrag from '../shaders/videoTexture.frag.wgsl?raw'
import MVP from '../hooks/MVP';
import videoUrl from '@/assets/video.mp4'
onMounted(async () => {
    run()
})
const run = async () => {
    // set Video element and play in advanced
    const video = document.createElement('video');
    video.loop = true
    video.autoplay = true
    video.muted = true
    video.src = videoUrl
    await video.play()

    let canvas = document.getElementById('webgpucanvas') as HTMLCanvasElement;
    const { device, context } = await useWebgpu(canvas);
    const { size } = await useContext(device, canvas, context)
    const pipelineobj = await initPipeline(device, basicVert, imageFrag, size, cube)

    const sampler = device.createSampler({
        // addressModeU: 'repeat',
        // addressModeV: 'repeat',
        magFilter: 'linear',
        minFilter: 'linear'
    })

    // defaut state
    const position1 = { x: 0, y: 0, z: -5 }
    const rotation1 = { x: 0, y: 0, z: 0 }
    const scale1 = { x: 1, y: 1, z: 1 }
    // start loop
    function frame() {
        const videoFrame = new VideoFrame(video)
        videoFrame.close()
        const texture = device.importExternalTexture({
            source: video
        })
        const videoGroup = device.createBindGroup({
            label: 'Texture Group with video',
            layout: pipelineobj.pipeline.getBindGroupLayout(1),
            entries: [
                {
                    binding: 0,
                    resource: sampler
                }, {
                    binding: 1,
                    resource: texture
                }
            ]
        })
        // first, update two transform matrixs
        const now = Date.now() / 1000
        // first cube
        rotation1.x = Math.sin(now)
        rotation1.y = Math.cos(now)
        const mvpMatrix1 = MVP(position1, scale1, rotation1, size)
        device.queue.writeBuffer(
            pipelineobj.mvpBuffer1,
            0,
            mvpMatrix1 as Float32Array
        )
        // then draw
        draw(device, context!, pipelineobj, videoGroup)
        requestAnimationFrame(frame)
    }
    frame()
}
const initPipeline = async (device: GPUDevice, basicVert: any, positionFrag: any, size: any, cube: any) => {
    const pipeline = await device.createRenderPipelineAsync({
        label: 'Basic Pipline',
        layout: 'auto',
        vertex: {
            module: device.createShaderModule({
                code: basicVert,

            }),
            entryPoint: 'main',
            buffers: [{
                arrayStride: 5 * 4, // 3 position 2 uv,
                attributes: [
                    {
                        // position
                        shaderLocation: 0,
                        offset: 0,
                        format: 'float32x3',
                    },
                    {
                        // uv
                        shaderLocation: 1,
                        offset: 3 * 4,
                        format: 'float32x2',
                    }
                ]
            }]
        },
        fragment: {
            module: device.createShaderModule({
                code: positionFrag,
            }),
            entryPoint: 'main',
            targets: [
                {
                    format: navigator.gpu.getPreferredCanvasFormat()
                }
            ]
        },
        primitive: {
            topology: 'triangle-list',
            // Culling backfaces pointing away from the camera
            cullMode: 'back'
        },
        // Enable depth testing since we have z-level positions
        // Fragment closest to the camera is rendered in front
        depthStencil: {
            depthWriteEnabled: true,
            depthCompare: 'less',
            format: 'depth24plus',
        }
    } as GPURenderPipelineDescriptor)
    // create depthTexture for renderPass
    const depthTexture = device.createTexture({
        size, format: 'depth24plus',
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
    })
    // create vertex buffer
    const vertexBuffer = device.createBuffer({
        label: 'GPUBuffer store vertex',
        size: cube.data.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    })
    device.queue.writeBuffer(vertexBuffer, 0, cube.data)
    // create a 4x4 mvp matrix1
    const mvpBuffer1 = device.createBuffer({
        label: 'GPUBuffer store 4x4 matrix1',
        size: 4 * 4 * 4, // 4 x 4 x float32
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })
    // create a uniform group for Matrix2
    const group1 = device.createBindGroup({
        label: 'Uniform Group with matrix1',
        layout: pipeline.getBindGroupLayout(0),
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: mvpBuffer1
                }
            }
        ]
    })
    return { pipeline, depthTexture, vertexBuffer, mvpBuffer1, group1 }
}

const draw = async (device: GPUDevice, context: GPUCanvasContext, pipelineobj: {
    pipeline: GPURenderPipeline,
    vertexBuffer: GPUBuffer,
    mvpBuffer1: GPUBuffer,
    group1: GPUBindGroup,
    depthTexture: GPUTexture
}, videoGroup: GPUBindGroup) => {
    const commandEncoder = device.createCommandEncoder()
    const passEncoder = commandEncoder.beginRenderPass({
        colorAttachments: [
            {
                view: context.getCurrentTexture().createView(),
                clearValue: { r: 0, g: 0, b: 0, a: 1.0 },
                loadOp: 'clear',
                storeOp: 'store'
            }
        ],
        depthStencilAttachment: {
            view: pipelineobj.depthTexture.createView(),
            depthClearValue: 1.0,
            depthLoadOp: 'clear',
            depthStoreOp: 'store',
        }
    })
    passEncoder.setPipeline(pipelineobj.pipeline)
    passEncoder.setBindGroup(0, pipelineobj.group1)
    passEncoder.setBindGroup(1, videoGroup)
    passEncoder.setVertexBuffer(0, pipelineobj.vertexBuffer)
    passEncoder.draw(cube.len)
    passEncoder.end()
    device.queue.submit([commandEncoder.finish()])
}
</script>

<style scoped lang="scss"></style>