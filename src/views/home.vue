<template>
    <ul v-for="i in items">
        <router-link :to="i.path">{{ i.name }}</router-link>
    </ul>
</template>

<script setup lang="ts">
import {reactive} from 'vue';
const items = reactive([
    {
        path:"/triangle",
        name:"01--绘制三角形"
    },
    {
        path:"/VertexBuffer",
        name:"02--顶点缓冲区"
    }
])
</script>

<style lang="scss" scoped></style>