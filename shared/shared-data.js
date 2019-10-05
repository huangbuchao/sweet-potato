/**
 * @flow
 */

import * as storage from "./storage";

const internalSharedData = {
  timeFormat: "default",
  componentNameStyle: "class",
  theme: "auto",
  displayDensity: "auto",
  recordPref: false,
  logDetected: true
};

const persisted = [
  'theme',
  'displayDensity',
  'logDetected'
];

let Watcher;
// eslint-disable-next-line no-unused-vars
let watcher;
let Vue;
let vm;
let bridge;
let persist = false;

export function init(params) {
  Vue = params.Vue;
  Watcher = params.Watcher;
  bridge = params.bridge;
  persist = !!params.persist;

  persisted.forEach(key => {
    const value = storage.get(`shared-data:${key}`);
    if(value !== null) {
      internalSharedData[key] = value;
      if(persist) {
        sendValue(key, value);
      }
    }
  });

  if(Vue) {
    vm = new Vue({
      data: internalSharedData
    });
  }

  if(Watcher) {
    watcher = new Watcher(internalSharedData);
  }

  bridge.on('shared-data:set', ({ key, value }) => {
    setValue(key, value)
  })
}

function setValue(key, value) {
  if(persist && persisted.includes(key)) {
    storage.set(`shared-data:${key}`, value);
  }

  vm[key] = value;

  return true;
}

function sendValue(key, value) {
  bridge && bridge.send('shared-data:set', {
    key,
    value
  });
}

export function destroy() {
  bridge.removeAllListeners('shared-data:set');
  vm.$destroy();
}

export function watch(args) {
  return Vue.$watch(...args);
}

const proxy = {};
Object.keys(internalSharedData).forEach(key => {
  Object.defineProperty(proxy, key, {
    configurable: false,
    get: () => vm && vm.$data[key],
    set: (value) => {
      sendValue(key, value);
      setValue(key, value);
    }
  });
});

export default proxy;