/**
 * @flow
 */
import Vue from "vue";
import { init as initStorage } from "shared/storage";
import App from "./App.vue";
import './plugins';

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

    bridge.on("test", () => {
      console.log("devtool test trigged!");
    });

    app = new Vue({
      extends: App
    }).$mount("#app");
  });
}
