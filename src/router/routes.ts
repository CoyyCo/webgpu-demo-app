export const routes = [
    {
        path:'/',
        name:'home',
        component:()=>import('@/views/home.vue')
    },
    {
        path:'/triangle',
        name:'triangle',
        component:()=>import('@/views/triangle.vue')
    },{
        path:'/VertexBuffer',
        name:"VertexBuffer",
        component:()=>import('@/views/VertexBuffer.vue')
    }
]