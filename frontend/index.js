/**
 * @flow
 */

import Vue from "vue";
import { init as initStorage } from "shared/storage";
import App from "./App.vue";
import "./plugins";
import * as filters from "./filters";
import { createStore } from "./store";
import router from "./router";
import SharedData, {
  init as initSharedData,
  destroy as destroySharedData
} from "shared/shared-data";
import { parse } from "shared/util";

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

    if (Vue.prototype.hasOwnProperty("$shared")) {
      destroySharedData();
    } else {
      Object.defineProperty(Vue.prototype, "$shared", {
        get: () => SharedData
      });
    }

    initSharedData({
      bridge,
      Vue,
      persist: true
    });

    const store = createStore();

    bridge.send("log-detected-cocos");

    bridge.on("ready", version => {
      store.commit("SHOW_MESSAGE", "Detected Cocos " + version + ".");
    });

    bridge.on("flush", payload => {
      store.commit("components/FLUSH", parse(payload));
    });

    bridge.on("inspect-instance", id => {
      bridge.send("select-instance", id);
      router.push({ name: "components" });
      const instance = store.state.components.instancesMap[id];
      instance &&
        store.dispatch("components/toggleInstance", {
          instance,
          expanded: true,
          parent: true
        });
    });

    document.body.classList.add('vue-ui-dark-mode')

    app = new Vue({
      extends: App,
      store,
      router,

      watch: {
        '$shared.theme': {
          handler (value) {
            if (value === 'dark') {
              document.body.classList.add('vue-ui-dark-mode')
            } else {
              //document.body.classList.remove('vue-ui-dark-mode')
            }
          },
          immediate: true
        }
      }
    }).$mount("#app");
  });
}
