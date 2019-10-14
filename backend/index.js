/**
 * @flow
 */

import { target, isBrowser } from "shared/env";
import { highLight, unHighLight, getInstanceRect } from "./highlighter";
import ComponentSelector from "./component-selector";
import { stringify, parse, set, flatten } from "../shared/util";
import { init as initStorage } from "../shared/storage";
//import SharedData, { init as initSharedData } from "../shared/shared-data";
import { installToast } from "./toast";

let bridge;
let filter = "";
let rootInstanceId;
let captureCount = 0;
let currentInspectedId;
let rootInstances = [];

const captureIds = new Map(); //dedupe
const hook = target.__POTATO_DEVTOOLS_GLOBAL_HOOK__;

export const instanceMap = (target.__POTATO_DEVTOOLS_INSTANCE_MAP__ = new Map());

export function initBackend(_bridge) {
  bridge = _bridge;

  hook.cc ? connect(hook.cc) : hook.once("init", connect);

  initRightClick();
}

// eslint-disable-next-line no-unused-vars
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

    bridge.on("select-instance", id => {
      currentInspectedId = id;
      const instance = findInstance(id);

      if (instance) {
        flush();
        bridge.send("instance-selected");
      }
    });

    bridge.on("scroll-to-instance", id => {
      const instance = findInstance(id);
      if (instance) {
        scrollToInstance(instance);
        highLight(instance);
      }
    });

    bridge.on("filter-instances", _filter => {
      filter = _filter;
      flush();
    });

    bridge.on("refresh", scan);

    bridge.on("enter-instance", id => {
      const instance = findInstance(id);
      if (instance) {
        highLight(instance);
      }
    });

    bridge.on("leave-instance", unHighLight);

    new ComponentSelector(bridge, instanceMap);

    bridge.on("set-instance-data", args => {
      setInstanceData(args);
      flush();
    });

    target.__POTATO_DEVTOOLS_INSPECT__ = inspectInstance;

    bridge.send("ready", hook.cc.ENGINE_VERSION);

    bridge.on("log-detected-cocos", () => {
      console.log(
        `%c potato-devtools %c Detected CocosEngine v${hook.cc.ENGINE_VERSION} %c`,
        "background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff",
        "background:#41b883 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff",
        "background:transparent"
      );
      console.log("view detail: https://github.com/huangbuchao/sweet-potato");
    });

    //sometime cc.director not already.
    setTimeout(() => {
      scan();
    }, 0);
  });
}

export function findInstance(id) {
  return instanceMap.get(id);
}

function scan() {
  rootInstances = [];
  const scene = hook.cc.director._scene;
  const canvas = scene && scene.children;

  rootInstanceId = canvas && canvas[0].__instanceId;

  if (canvas) {
    canvas[0].$rootParent = canvas[0];
    canvas[0].__POTATO_DEVTOOLS_SELECTOR_SCALEX__ = canvas[0].scaleX;
    canvas[0].__POTATO_DEVTOOLS_SELECTOR_SCALEY__ = canvas[0].scaleY;

    walk(canvas[0], node => {
      if (!node.$rootParent) {
        node.$rootParent = canvas[0];
      }
      node.__POTATO_DEVTOOLS_SELECTOR_SCALEX__ = node.scaleX * node.parent.__POTATO_DEVTOOLS_SELECTOR_SCALEX__;
      node.__POTATO_DEVTOOLS_SELECTOR_SCALEY__ = node.scaleY * node.parent.__POTATO_DEVTOOLS_SELECTOR_SCALEY__;
    });

    canvas && rootInstances.push(...canvas);
    flush();
  } else {
    toast(
      "detected cc.director is not already, next please click refresh!",
      "warn"
    );
  }
}

// eslint-disable-next-line no-unused-vars
function walk(node, fnc) {
  if (node.children) {
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      fnc && fnc(child);
      if (child.children.length !== 0) {
        walk(child, fnc);
      }
    }
  }
}

function flush() {
  let start;
  captureIds.clear();

  if (process.env.NODE_ENV !== "production") {
    captureCount = 0;
    start = isBrowser ? window.performance.now() : 0;
  }

  const payload = stringify({
    inspectedInstance: getInstanceDetails(currentInspectedId),
    instances: findQualifiedInstances(rootInstances)
  });

  if (process.env.NODE_ENV !== "production") {
    console.log(
      `[flush]: serialized ${captureCount} instances${
        isBrowser ? `, took ${window.performance.now() - start}ms.` : "."
      }`
    );
  }

  bridge.send("flush", payload);
}

function getInstanceDetails(id) {
  const instance = instanceMap.get(id);
  if (!instance) {
    return {};
  }

  const data = {
    id,
    name: instance.name,
    state: getInstanceState(instance)
  };

  return data;
}

const instanceProperties = [
  "uuid",
  "active",
  "x",
  "y",
  "anchorX",
  "anchorY",
  "rotationX",
  "rotationY",
  "scaleX",
  "scaleY",
  "skewX",
  "skewY",
  "opacity",
  "width",
  "height",
  "zIndex",
  "childrenCount",
  "color"
];

function getInstanceState(instance) {
  return processProperties(instance).concat(
    processComponents(instance),
    processListeners(instance)
  );
}

function processComponents(instance) {
  const components = instance._components;
  return components.map((component, index) => {
    const name = component.name.match(/(?:\S+)<(\S+)>/)[1];
    return {
      type: "components",
      key: `component${index}`,
      value: name,
      editable: false
    };
  });
}

function processListeners(instance) {
  const bubbles = instance._bubblingListeners;
  const captures = instance._capturingListeners;
  const listeners = {
    bubblingListeners:
      bubbles === null ? null : Object.keys(bubbles._callbackTable),
    capturingListeners:
      captures === null ? null : Object.keys(captures._callbackTable)
  };

  return Object.keys(listeners).map(key => {
    let value = listeners[key];
    return {
      type: "listeners",
      key,
      value,
      editable: false
    };
  });
}

function processProperties(instance) {
  return instanceProperties.map(property => {
    const value = instance[property];
    return {
      type: "properties",
      key: property,
      value: property !== "color" ? value : getColor(value),
      editable:
        property !== "uuid" &&
        property !== "color" &&
        property !== "childrenCount"
          ? true
          : false
    };
  });
}

function getColor(obj) {
  const { r, g, b, a } = obj;
  return { r, g, b, a };
}

function findQualifiedInstances(instances) {
  if (instances.length === 0) return [];

  return !filter
    ? instances.map(capture)
    : flatten(
      Array.prototype.concat.call([], instances.map(findQualifiedChildren))
    );
}

function findQualifiedChildren(instance) {
  return isQualified(instance)
    ? capture(instance)
    : findQualifiedInstances(instance.children);
}

function isQualified(instance) {
  let reg = /^\/([\s\S]+)\/$/;
  const name = instance.name;
  if (reg.test(filter)) {
    let match = filter.match(reg)[1];
    return new RegExp(match).test(name);
  } else {
    let lowerName = name.toLowerCase();
    let lowerFilter = filter.toLowerCase();
    return lowerName.indexOf(lowerFilter) > -1;
  }
}

function capture(instance, index, list) {
  if (process.env.NODE_ENV !== "production") {
    captureCount++;
  }

  instance.__POTATO_DEVTOOLS_UID__ = getUniqueID(instance);

  if (captureIds.has(instance.__POTATO_DEVTOOLS_UID__)) {
    return;
  } else {
    captureIds.set(instance.__POTATO_DEVTOOLS_UID__, undefined);
  }

  const name = instance.name ? instance.name : "AnonymousNode";

  mark(instance);

  const ret = {
    uid: instance.__instanceId,
    id: instance.__POTATO_DEVTOOLS_UID__,
    name,
    inactive: !instance.active,
    children: instance.children.map(capture).filter(Boolean)
  };

  if ((!list || list.length > 1) && instance.active) {
    const rect = getInstanceRect(instance);
    ret.top = rect ? rect.top : Infinity;
  } else {
    ret.top = Infinity;
  }

  return ret;
}

function getUniqueID(instance) {
  return `${rootInstanceId}:${instance.__instanceId}`;
}

function mark(instance) {
  if (!instanceMap.has(instance.__POTATO_DEVTOOLS_UID__)) {
    instanceMap.set(instance.__POTATO_DEVTOOLS_UID__, instance);
  }
}

export function getCustomInstanceDetails() {}

export function toast(message, type = "normal") {
  const fnc = target.__POTATO_DEVTOOLS_TOAST__;
  fnc && fnc(message, type);
}

export function inspectInstance() {}

export function scrollToInstance() {}

function setInstanceData({ id, path, value }) {
  const instance = instanceMap.get(id);
  if (instance) {
    try {
      const parseValue = parse(value);
      set(instance, path, parseValue);
    } catch (error) {
      console.error(error);
    }
  }
}

function initRightClick() {
  if (!isBrowser) return;

  document.addEventListener("contextmenu", event => {
    const el = event.target;
    console.log("right click capture dom: ", el);
    window.__POTATO_DEVTOOLS_CONTEXT_MENU_HAS_TARGET__ = null;
    window.__POTATO_DEVTOOLS_CONTEXT_MENU_TARGET__ = null;
  });
}
