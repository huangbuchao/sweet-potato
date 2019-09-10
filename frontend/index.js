/**
 * @flow
 */

import Vue from "vue";
import { init as initStorage } from "shared/storage";
import App from "./App.vue";
import './plugins';
import * as filters from './filters';
import { createStore } from './store';
import router from './router';

for (const key in filters) {
  Vue.filter(key, filters[key]);
}

Vue.options.renderError = (h, e) => {
  return h(
    "pre",
    {
      style: {
        backgroundColor: "red",
        color: "white",
        fontSize: "12px",
        padding: "10px"
      }
    },
    e.stack
  );
};

let app = null;

export function initDevtools(shell) {
  initStorage().then(() => {
    initApp(shell);
    shell.onReload(() => {
      if (app) {
        app.$destroy();
      }
      bridge.removeAllListeners();
      initApp(shell);
    });
  });
}

function initApp(shell) {
  shell.connect(bridge => {
    window.bridge = bridge;

    const store = createStore();

    bridge.send('log-detected-cocos');

    bridge.on("ready", version => {
      store.commit('SHOW_MESSAGE', 'Ready. Detected Cocos ' + version + '.');
    });

    app = new Vue({
      extends: App,
      store,
      router
    }).$mount("#app");
  });
}
