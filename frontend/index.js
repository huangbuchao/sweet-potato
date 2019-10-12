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
import { isChrome, initEnv } from "shared/env";

for (const key in filters) {
  Vue.filter(key, filters[key]);
}

let panelShown = !isChrome
let pendingAction = null

const chromeTheme = isChrome ? chrome.devtools.panels.themeName : undefined
//const isBeta = process.env.RELEASE_CHANNEL === 'beta'

if (isChrome) {
  Vue.config.errorHandler = (e, vm) => {
    bridge.send('ERROR', {
      message: e.message,
      stack: e.stack,
      component: vm.$options.name || vm.$options._componentTag || 'anonymous'
    })
  }

  chrome.runtime.onMessage.addListener(request => {
    if (request === 'potato-panel-shown') {
      onPanelShown()
    } else if (request === 'potato-panel-hidden') {
      onPanelHidden()
    } else if (request === 'vue-get-context-menu-target') {
      getContextMenuInstance()
    }
  })
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
      setTimeout(() => {
        initApp(shell);
      }, 2000);
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

      if (isChrome) {
        chrome.runtime.sendMessage('potato-panel-load')
      }
    });

    bridge.once('proxy-fail', () => {
      store.commit(
        'SHOW_MESSAGE',
        'Proxy injection failed.'
      )
    });

    bridge.on("flush", payload => {
      store.commit("components/FLUSH", parse(payload));
    });

    bridge.on('inspect-instance', id => {
      ensurePaneShown(() => {
        bridge.send('select-instance', id)
        router.push({ name: 'components' })
        const instance = store.state.components.instancesMap[id]
        instance && store.dispatch('components/toggleInstance', {
          instance,
          expanded: true,
          parent: true
        })
      })
    })

    initEnv(Vue);

    app = new Vue({
      extends: App,
      store,
      router,

      watch: {
        '$shared.theme': {
          handler (value) {
            if (value === 'dark' || chromeTheme === 'drak') {
              document.body.classList.add('vue-ui-dark-mode')
            } else {
              document.body.classList.remove('vue-ui-dark-mode')
            }
          },
          immediate: true
        }
      }
    }).$mount("#app");
  });
}


function getContextMenuInstance () {
  bridge.send('get-context-menu-target')
}

// Pane visibility management

function ensurePaneShown (cb) {
  if (panelShown) {
    cb()
  } else {
    pendingAction = cb
  }
}

function onPanelShown () {
  panelShown = true
  if (pendingAction) {
    pendingAction()
    pendingAction = null
  }
}

function onPanelHidden () {
  panelShown = false
}