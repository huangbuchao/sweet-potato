/**
 * @flow
 */

import { target, isBrowser } from "shared/env";
import { highLight, unHighLight, getInstanceRect } from "./highlighter";
import ComponentSelector from "./component-selector";
import { stringify, parse, set, has, getComponentName } from "../shared/util";
import { init as initStorage } from "../shared/storage";
import SharedData, { init as initSharedData } from "../shared/shared-data";

let bridge;
let rootUID = 0;
let captureCount = 0;
let currentInspectedId;

const rootInstances = [];
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
    //   cc
    // });

    hook.currentTab = "components";
    bridge.on("switch-tab", tab => {
      hook.currentTab = tab;
      if (tab === "components") {
        flush();
      }
    });

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

    hook.off("flush");
    hook.on("flush", () => {
      if (hook.currentTab === "components") {
        flush();
      }
    });
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
  });
}

function scan() {}

function processInstance() {}

function walk() {}

function flush() {
  console.log("flush");
}

export function getCustomInstanceDetails() {}

function initRightClick() {
  if (!isBrowser) return;
  // Start recording context menu when Vue is detected
  // event if Vue devtools are not loaded yet
  document.addEventListener("contextmenu", event => {
    const el = event.target;
    console.log(el);
    if (el) {
      // Search for parent that "is" a component instance
      // const instance = findRelatedComponent(el)
      // if (instance) {
      //   window.__VUE_DEVTOOLS_CONTEXT_MENU_HAS_TARGET__ = true
      //   window.__VUE_DEVTOOLS_CONTEXT_MENU_TARGET__ = instance
      //   return
      // }
    }
    window.__VUE_DEVTOOLS_CONTEXT_MENU_HAS_TARGET__ = null;
    window.__VUE_DEVTOOLS_CONTEXT_MENU_TARGET__ = null;
  });
}
