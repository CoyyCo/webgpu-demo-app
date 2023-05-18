import { list } from "./list";
export const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("@/views/home.vue"),
  },
  ...list
];
