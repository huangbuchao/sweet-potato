/**
 * @flow
 */

import Vue from "vue";
import VueRouter from "vue-router";

import Components from "./views/components/ComponentTab.vue";
import Stats from "./views/stats/Stats.vue";
import Store from "./views/store/Store.vue";
import Setting from "./views/setting/Setting.vue";
import Router from "./views/router/Router.vue";

//in order to advoid NavigationDuplicated error message, rewrite VueRouter.prototype.push.
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location, onResolve, onReject) {
  if(onResolve || onReject) return originalPush.call(this, location, onResolve, onReject);
  return originalPush.call(this, location).catch(err => err);
}

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: { name: 'components' }
  },
  {
    path: '/components',
    name: 'components',
    component: Components
  },
  {
    path: '/store',
    name: 'store',
    component: Store
  },
  {
    path: '/router',
    name: 'router',
    component: Router
  },
  {
    path: '/stats',
    component: Stats,
    name: 'stats',
    children: [
      {
        path: 'fps',
        name: 'fps',
        component: Stats
      },
      {
        path: 'component-render',
        name: 'component-render',
        component: Stats
      }
    ]
  },
  {
    path: '/setting',
    name: 'setting',
    component: Setting
  },
  {
    path: '*',
    redirect: '/'
  }
];

const router = new VueRouter({
  routes
});

export default router;
