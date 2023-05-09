export const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("@/views/home.vue"),
  },
  {
    path: "/triangle",
    name: "triangle",
    component: () => import("@/views/triangle.vue"),
  },
  {
    path: "/VertexBuffer",
    name: "VertexBuffer",
    component: () => import("@/views/VertexBuffer.vue"),
  },
  {
    path: "/VertexBuffer2",
    name: "VertexBuffer2",
    component: () => import("@/views/VertexBuffer2.vue"),
  },
  {
    path: "/BufferBind",
    name: "BufferBind",
    component: () => import("@/views/BufferBind.vue"),
  },
  {
    path:"/colorsTriangle",
    name:"colorsTriangle",
    component:()=>import("@/views/colorsTriangle.vue")
},
];
