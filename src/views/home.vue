<template>
    <ul>
        <template v-for="i in list">
            <router-link :to="i.path">
                <li>{{ i.name }}</li>
            </router-link>
        </template>

    </ul>
</template>

<script setup lang="ts">
import {list} from '@/router/list.ts'
// import { reactive } from 'vue';
</script>

<style lang="scss" scoped>
li {
    list-style: decimal;
}
</style>