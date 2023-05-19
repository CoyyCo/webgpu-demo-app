export const list = [
  {
    path: "/triangle",
    name: "绘制三角形",
    component: () => import("@/views/triangle.vue"),
  },
  {
    path: "/triangleMSAA",
    name: "多采样抗锯齿",
    component: () => import("@/views/triangleMSAA.vue"),
  },
  {
    path: "/VertexBuffer",
    name: "顶点缓冲区",
    component: () => import("@/views/VertexBuffer.vue"),
  },
  {
    path: "/VertexBuffer2",
    name: "顶点缓冲区之多参数",
    component: () => import("@/views/VertexBuffer2.vue"),
  },
  {
    path: "/BufferBind",
    name: "资源绑定之缓冲区",
    component: () => import("@/views/BufferBind.vue"),
  },
  {
    path: "/colorsTriangle",
    name: "多颜色三角形",
    component: () => import("@/views/colorsTriangle.vue"),
  },
  {
    path: "/cube",
    name: "绘制立方体",
    component: () => import("@/views/cube.vue"),
  },
  {
    path: "/cube2",
    name: "两个立方体",
    component: () => import("@/views/cube2.vue"),
  },
  {
    path: "/cubeAndtriangle",
    name: "绘制立方体和三角形",
    component: () => import("@/views/cubeAndtriangle.vue"),
  },
];
