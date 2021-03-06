/**
 * @flow
 */

import { target, isBrowser } from "shared/env";
// eslint-disable-next-line no-unused-vars
import { highLight, unHighLight } from "./highlighter";
import ComponentSelector from "./component-selector";
import { stringify, parse, set, flatten, getCustomFunctionDetails } from "../shared/util";
import { init as initStorage } from "../shared/storage";
//import SharedData, { init as initSharedData } from "../shared/shared-data";
import { installToast } from "./toast";

let bridge;
let filter = "";
let rootInstanceId;
let captureCount = 0;
let currentInspectedId;
let rootInstances = [];
const rootInstance = {};
let consoleInstances = Array(5);

const captureScaleXs = new Map();
const captureScaleYs = new Map();
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
      const instance = findInstance(id);
      currentInspectedId = id;

      if (instance) {
        bindShortcutToConsole(instance);
        flush();
        bridge.send("instance-selected");
      }
    });

    bridge.on("scroll-to-instance", id => {
      const instance = findInstance(id);
      if (instance) {
        scrollToInstance(instance);
        highLight(instance, getInstanceRect(instance));
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
        highLight(instance, getInstanceRect(instance));
      }
    });

    bridge.on("leave-instance", unHighLight);

    new ComponentSelector(bridge, instanceMap, rootInstance, captureScaleXs, captureScaleYs);

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
  if(!instanceMap.has(id)) {
    onContextChange();
    return;
  }

  const instance = instanceMap.get(id);
  if(!instance._parent) {
    onContextChange();
    return;
  }

  return instance;
}

function scan() {
  rootInstances = [];
  const canvas = getCCContext();

  currentInspectedId = null;
  consoleInstances = Array(5);

  if (canvas && canvas.length !== 0) {
    rootInstanceId = canvas && canvas[0].__instanceId;
    rootInstance.root = canvas[0];

    // walk(canvas[0], node => {
    //   if (!node.$rootParent) {
    //     node.$rootParent = canvas[0];
    //   }
    // });

    canvas && rootInstances.push(...canvas);
    flush();
  } else {
    toast(
      "cc.director is not already, now launch game, click refresh or reload devPanel!",
      "warn"
    );
  }
}

function getCCContext() {
  const director = hook.cc.director;
  const scene = director && director._scene;
  const canvas = scene && scene.children;
  return canvas;
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
  if(currentInspectedId) {
    if (instanceDestroyed(currentInspectedId)) {
      scan();
      return
    }
  }

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

function instanceDestroyed(instance) {
  if(typeof instance === "number") {
    const inst = instanceMap.get(instance);
    return !inst._parent;
  }
  return !instance._parent;
}

function onContextChange() {
  scan();
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
  "activeInHierarchy",
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

const targetComponents = {
  Sprite: [
    "enabled",
    "enabledInHierarchy",
    "type",
    "sizeMode",
    "trim",
    "fillType",
    "fillRange",
    "fillStart",
    "fillCenter",
    "spriteFrame"
  ],
  fillCenter: [
    "x",
    "y"
  ],
  spriteFrame: [
    "_name",
    "_textureFilename",
    "_texture"
  ],
  _texture: [
    "url",
    "width",
    "height"
  ]
};

function getInstanceState(instance) {
  return processProperties(instance).concat(
    processComponents(instance),
    processListeners(instance)
  );
}

function processComponents(instance) {
  const components = instance._components;
  return components.map(component => {
    const name = component.name.match(/(?:\S+)<(\S+)>/)[1];
    return {
      type: "components",
      key: name,
      value: name === "Sprite" ? captureSprite(component) : captureFunction(component),
      editable: false
    };
  });
}

function captureSprite(sprite) {
  const data = {};
  walkObj(targetComponents.Sprite, data, sprite);
  return data;
}

function walkObj(target, data, component) {
  target.forEach(key => {
    if(targetComponents[key] && component[key]) {
      data[key] = {};
      walkObj(targetComponents[key], data[key], component[key]);
    }else{
      data[key] = component[key];
    }
  });
}

// function captureSkeleton() {
//   return {}
// }

function captureFunction(component) {
  if(!component.actions) return {};
  const actions = {};
  Object.keys(component.actions).forEach(key => {
    actions[key] = getCustomFunctionDetails(component.actions[key]);
  });
  return {
    actions
  };
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
        property !== "childrenCount" &&
        property !== "activeInHierarchy"
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

// eslint-disable-next-line no-unused-vars
function capture(instance, index, list) {
  if (process.env.NODE_ENV !== "production") {
    captureCount++;
  }

  if (captureIds.has(instance.__instanceId)) {
    return;
  } else {
    captureIds.set(instance.__instanceId, undefined);
  }

  captureScaleXs.set(
    instance.__instanceId,
    walkParentScale(instance, "scaleX")
  );

  captureScaleYs.set(
    instance.__instanceId,
    walkParentScale(instance, "scaleY")
  );

  const name = instance.name ? instance.name : "AnonymousNode";

  mark(instance);

  const ret = {
    id: instance.__instanceId,
    name,
    inactive: !instance.active,
    children: instance.children.map(capture).filter(Boolean)
  };
  //TODO:
  // if ((!list || list.length > 1) && instance.active) {
  //   const rect = getInstanceRect(instance);
  //   ret.top = rect ? rect.top : Infinity;
  // } else {
  //   ret.top = Infinity;
  // }

  const consoleId = consoleInstances.indexOf(instance.__instanceId);
  ret.consoleId = consoleId > -1 ? "$h" + consoleId : null;

  return ret;
}

function walkParentScale(node, property) {
  let accumulation = node[property];
  if (node._parent) {
    accumulation *= walkParentScale(node._parent, property);
  }
  return accumulation;
}

// eslint-disable-next-line no-unused-vars
function getUniqueID(instance) {
  return `${rootInstanceId}:${instance.__instanceId}`;
}

function mark(instance) {
  // if (!instanceMap.has(instance.__instanceId)) {
  //   instanceMap.set(instance.__instanceId, instance);
  // }
  instanceMap.set(instance.__instanceId, instance);
}

export function getCustomInstanceDetails() {}

export function toast(message, type = "normal") {
  const fnc = target.__POTATO_DEVTOOLS_TOAST__;
  fnc && fnc(message, type);
}

export function inspectInstance() {}

export function scrollToInstance() {}

function setInstanceData({ id, path, value }) {
  const instance = findInstance(id)
  if (instance) {
    try {
      const parseValue = parse(value);
      set(instance, path, parseValue);
    } catch (error) {
      console.error(error);
    }
  }
}

export function getInstanceRect(instance) {
  if(!isBrowser) return; //TODO
  if(!instance) return;
  if(!rootInstance.root) return;

  const instanceRect = {};

  const rootScaleX = captureScaleXs.get(rootInstance.root.__instanceId);
  const rootScaleY = captureScaleYs.get(rootInstance.root.__instanceId);

  const canvas = document.getElementsByTagName('canvas');
  const canvasRect = canvas[0].getBoundingClientRect()

  //TODO: anchor transform.
  //TODO: rotation solution.
  const { width, height } = instance;
  const __POTATO_DEVTOOLS_SELECTOR_SCALEX__= captureScaleXs.get(instance.__instanceId);
  const __POTATO_DEVTOOLS_SELECTOR_SCALEY__ = captureScaleYs.get(instance.__instanceId);
  const widthT = width * __POTATO_DEVTOOLS_SELECTOR_SCALEX__;
  const heightT = height * __POTATO_DEVTOOLS_SELECTOR_SCALEY__;
  const { x, y } = instance.parent.convertToWorldSpaceAR({ x: instance.x, y: instance.y });

  const widthRatio = canvasRect.width / (rootInstance.root.width * rootScaleX);
  const heightRatio = canvasRect.height / (rootInstance.root.height * rootScaleY);
  const relativeY = (rootInstance.root.height * rootScaleY) - y;

  instanceRect.width = widthT * widthRatio;
  instanceRect.height = heightT * heightRatio;
  instanceRect.left = x * widthRatio + canvasRect.left - instanceRect.width / 2;
  instanceRect.top = relativeY * heightRatio + canvasRect.top - instanceRect.height / 2;

  return instanceRect;
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

function bindShortcutToConsole(instance) {
  if(!instance) return;
  if(!isBrowser) return;

  const id = instance.__instanceId;
  const index = consoleInstances.indexOf(id);

  if(index > -1) {
    consoleInstances.splice(index, 1);
  }else{
    consoleInstances.pop();
  }

  consoleInstances.unshift(id);

  for (let i = 0; i < 5; i++) {
    window["$h" + i] = instanceMap.get(consoleInstances[i]);
  }
  window["$h"] = instance;
}

window["$hh"] = function (arg) {
  if(typeof arg === "number") {
    return instanceMap.get(arg);
  }
  if(typeof arg === "string") {
    return Array.from(instanceMap.values()).filter(node => node.name === arg || node.uuid === arg);
  }
  if(Object.prototype.toString.call(arg) === "[object RegExp]") {
    return Array.from(instanceMap.values()).filter(node => arg.test(node.name));
  }
  return null;
}
