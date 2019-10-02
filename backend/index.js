/**
 * @flow
 */

import { target, isBrowser } from "shared/env";
import { highLight, unHighLight, getInstanceRect } from "./highlighter";
import ComponentSelector from "./component-selector";
import { stringify, parse, set, has, getComponentName, flatten } from "../shared/util";
import { init as initStorage } from "../shared/storage";
import SharedData, { init as initSharedData } from "../shared/shared-data";
import { installToast } from './toast';

let bridge;
let filter = '';
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
      console.log(currentInspectedId, instance);
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

    bridge.on('filter-instances', _filter => {
      filter = _filter;
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

    bridge.send("ready", hook.cc.ENGINE_VERSION);

    bridge.on("log-detected-cocos", () => {
      console.log(
        `%c potato-devtools %c Detected CocosEngine v${hook.cc.ENGINE_VERSION} %c`,
        "background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff",
        "background:#41b883 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff",
        "background:transparent"
      );
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

  if(canvas) {
    canvas[0].$rootParent = canvas[0];

    walk(canvas[0], node => {
      if(!node.$rootParent) {
        node.$rootParent = canvas[0];
      }
    });

    canvas && rootInstances.push(...canvas);
    flush();
  }else{
    toast('detected cc.director is not already, next please click refresh!', 'warn');
  }
}

// eslint-disable-next-line no-unused-vars
function walk(node, fnc) {
  if(node.children) {
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      fnc && fnc(child);
      if(child.children.length !== 0) {
        walk(child, fnc);
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
    instances: findQualifiedInstances(rootInstances)
  });

  if(process.env.NODE_ENV !== 'production') {
    console.log(`[flush]: serialized ${captureCount} instances${
      isBrowser ? `, took ${window.performance.now() - start}ms.` : '.'}`
    );
  }
  console.log('instanceMap: ', instanceMap)
  console.log('captureIds: ', captureIds)
  console.log('payload: ', payload)
  bridge.send('flush', payload)
}

function getInstanceDetails() {

}

function findQualifiedInstances(instances) {
  if(instances.length === 0) return [];

  return !filter ?
    instances.map(capture) :
    flatten(Array.prototype.concat.call([], instances.map(findQualifiedChildren)));
}

function findQualifiedChildren(instance) {
  return isQualified(instance) ? capture(instance) : findQualifiedInstances(instance.children);
}

function isQualified(instance) {
  let reg = /^\/([\s\S]+)\/$/;
  const name = instance.name;
  if(reg.test(filter)) {
    let match = filter.match(reg)[1];
    return new RegExp(match).test(name);
  }else{
    let lowerName = name.toLowerCase();
    let lowerFilter = filter.toLowerCase();
    return lowerName.indexOf(lowerFilter) > -1;
  }
}

function capture(instance, index, list) {
  if(process.env.NODE_ENV !== 'production') {
    captureCount++;
  }

  instance.__POTATO_DEVTOOLS_UID__ = getUniqueID(instance);

  if(captureIds.has(instance.__POTATO_DEVTOOLS_UID__)) {
    return;
  }else{
    captureIds.set(instance.__POTATO_DEVTOOLS_UID__, undefined);
  }

  const name = instance.name ? instance.name : 'AnonymousNode';

  mark(instance);

  const ret = {
    uid: instance.__instanceId,
    id: instance.__POTATO_DEVTOOLS_UID__,
    name,
    inactive: !instance.active,
    children: instance.children.
      map(capture).
      filter(Boolean)
  };

  if((!list || list.length > 1) && instance.active) {
    const rect = getInstanceRect(instance);
    ret.top = rect ? rect.top : Infinity;
  }else{
    ret.top = Infinity;
  }

  return ret;
}

function getUniqueID(instance) {
  return `${rootInstanceId}:${instance.__instanceId}`;
}

function mark(instance) {
  if(!instanceMap.has(instance.__POTATO_DEVTOOLS_UID__)) {
    instanceMap.set(instance.__POTATO_DEVTOOLS_UID__, instance);
  }
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
