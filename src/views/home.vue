<template>
    <ul v-for="i in items">
        <router-link :to="i.path">{{ i.name }}</router-link>
    </ul>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
const items = reactive([
    {
        path: "/triangle",
        name: "01--绘制三角形"
    },
    {
        path: "/VertexBuffer",
        name: "02--顶点缓冲区"
    },
    {
        path: "/VertexBuffer2",
        name: "03--顶点缓冲区之多参数"
    },
    {
        path: "/BufferBind",
        name: "04--资源绑定之缓冲区"
    },{
        path:"/colorsTriangle",
        name:"05--多颜色三角形"
    }
])
</script>

<style lang="scss" scoped></style>