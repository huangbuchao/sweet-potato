/* eslint-disable no-unused-vars */
/**
 * @flow
 */

import { target, isBrowser } from "shared/env";
import { highLight, unHighLight, getInstanceRect } from "./highlighter";
import ComponentSelector from "./component-selector";
import { stringify, parse, set, has, getComponentName } from "../shared/util";
import { init as initStorage } from "../shared/storage";
import SharedData, { init as initSharedData } from "../shared/shared-data";
import { installToast } from './toast';

const testInstances = {
  inspectedInstance: {},
  instances: [
    {
      uid: 2,
      id: "1:2",
      name: "Root",
      inactive: false,
      children: [
        {
          uid: 2,
          id: "1:3",
          name: "Node1",
          inactive: false,
          children: [
            {
              uid: 2,
              id: "1:6",
              name: "Node1-2",
              inactive: false,
              children: [],
              top: "",
              consoleId: null
            },
            {
              uid: 2,
              id: "1:7",
              name: "Node1-2",
              inactive: false,
              children: [],
              top: "",
              consoleId: null
            }
          ],
          top: "",
          consoleId: null
        },
        {
          uid: 2,
          id: "1:4",
          name: "Node2",
          inactive: false,
          children: [],
          top: "",
          consoleId: null
        }
      ],
      top: "",
      consoleId: null
    }
  ]
};

let bridge;
let filter = '';
let rootUID = 0;
let captureCount = 0;
let currentInspectedId;
let rootInstance = null;

const captureIds = new Map(); //dedupe
const hook = target.__POTATO_DEVTOOLS_GLOBAL_HOOK__;

export const instanceMap = (target.__POTATO_DEVTOOLS_INSTANCE_MAP__ = new Map());

export function initBackend(_bridge) {
  bridge = _bridge;

  hook.cc ? connect(hook.cc) : hook.once("init", connect);

  initRightClick();
}

function connect(cc) {
  initStorage().then(() => {

    // initSharedData({
    //   bridge,
    // });

    installToast(window);

    hook.currentTab = "components";
    bridge.on("switch-tab", tab => {
      hook.currentTab = tab;
      if (tab === "components") {
        flush();
      }
    });

    hook.off("flush");
    hook.on("flush", () => {
      if (hook.currentTab === "components") {
        flush();
      }
    });

    bridge.on('select-instance', id => {
      currentInspectedId = id;
      const instance = findInstance(id);
      if(instance) {
        flush();
        bridge.send('instance-selected');
      }
    });

    bridge.on('scroll-to-instance', id => {
      const instance = findInstance(id);
      if(instance) {
        scrollToInstance(instance);
        highLight(instance);
      }
    });

    bridge.on('filter-instance', _filter => {
      filter = _filter.toLowerCase();
      flush();
    });

    bridge.on('refresh', scan);

    bridge.on('enter-instance', id => {
      const instance = findInstance(id);
      if(instance) {
        highLight(instance);
      }
    });

    bridge.on('leave-instance', unHighLight);

    new ComponentSelector(bridge, instanceMap);

    bridge.on('set-instance-data', args => {
      setInstanceData(args);
      flush();
    });

    target.__POTATO_DEVTOOLS_INSPECT__ = inspectInstance;

    bridge.send("flush", JSON.stringify(testInstances));
    bridge.send("ready", hook.cc.ENGINE_VERSION);

    bridge.on("log-detected-cocos", () => {
      console.log(
        `%c potato-devtools %c Detected CocosEngine v${hook.cc.ENGINE_VERSION} %c`,
        "background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff",
        "background:#41b883 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff",
        "background:transparent"
      );
    });

    setTimeout(() => {
      scan();
    }, 0);
  });
}

export function findInstance(id) {
  return instanceMap(id);
}

function scan() {
  const rootInstance = hook.cc.director._scene;
  if(!rootInstance.__POTATO_DEVTOOLS_ROOT_UID__) {
    rootInstance.__POTATO_DEVTOOLS_ROOT_UID__ = ++rootUID;
  }
  flush();
}

//function processInstance() {}

function walk(node, fnc) {
  if(node.children) {
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      fnc && fnc(child);
      if(node.children.length !== 0) {
        walk(node, fnc);
      }
    }
  }
}

function flush() {
  let start;
  captureIds.clear();

  if(process.env.NODE_ENV !== 'production') {
    captureCount = 0;
    start = isBrowser ? window.performance.now() : 0;
  }

  const payload = stringify({
    inspectInstance: getInstanceDetails(currentInspectedId),
    instances: null
  });
}

function getInstanceDetails() {

}

export function getCustomInstanceDetails() {}

export function toast(message, type = 'normal') {
  const fnc = target.__POTATO_DEVTOOLS_TOAST__;
  fnc && fnc(message, type);
}

export function inspectInstance() {

}

export function scrollToInstance(instance) {

}

function setInstanceData(args) {

}

function initRightClick() {
  if (!isBrowser) return;

  document.addEventListener("contextmenu", event => {
    const el = event.target;
    console.log(el);
    // if (el) {
    //   Search for parent that "is" a component instance
    //   const instance = findRelatedComponent(el)
    //   if (instance) {
    //     window.__POTATO_DEVTOOLS_CONTEXT_MENU_HAS_TARGET__ = true
    //     window.__POTATO_DEVTOOLS_CONTEXT_MENU_TARGET__ = instance
    //     return
    //   }
    // }
    window.__POTATO_DEVTOOLS_CONTEXT_MENU_HAS_TARGET__ = null;
    window.__POTATO_DEVTOOLS_CONTEXT_MENU_TARGET__ = null;
  });
}
