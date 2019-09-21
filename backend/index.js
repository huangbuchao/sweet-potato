/**
 * @flow
 */
import { target } from "shared/env";

const hook = target.__POTATO_DEVTOOLS_GLOBAL_HOOK__;
//const rootInstances = [];
let bridge;

export const instanceMap = target.__POTATO_DEVTOOLS_INSTANCE_MAP__ = new Map();

export function initBackend(_bridge) {
  bridge = _bridge;

  hook.currentTab = 'components';
  bridge.on('switch-tab', tab => {
    hook.currentTab = tab;
    if(tab === 'components') {
      flush();
    }
  });

  const testInstances = {inspectedInstance: {}, instances: [
    {
      "uid":2,
      "id":"1:2",
      "name":"Root",
      "inactive":false,
      "children":[
        {
          "uid":2,
          "id":"1:2",
          "name":"Node1",
          "inactive":false,
          "children":[
            {
              "uid":2,
              "id":"1:2",
              "name":"Node1-2",
              "inactive":false,
              "children":[],
              "top":"__potato_devtool_infinity__",
              "consoleId":null
            },
            {
              "uid":2,
              "id":"1:2",
              "name":"Node1-2",
              "inactive":false,
              "children":[],
              "top":"__potato_devtool_infinity__",
              "consoleId":null
            }
          ],
          "top":"__potato_devtool_infinity__",
          "consoleId":null
        },
        {
          "uid":2,
          "id":"1:2",
          "name":"Node2",
          "inactive":false,
          "children":[],
          "top":"__potato_devtool_infinity__",
          "consoleId":null
        }
      ],
      "top":"__potato_devtool_infinity__",
      "consoleId":null
    }
  ]};

  hook.off('flush');
  hook.on('flush', () => {
    if(hook.currentTab === 'components') {
      flush();
    }
  });

  bridge.send('ready', hook.CC.ENGINE_VERSION);
  bridge.on('log-detected-cocos', () => {
    console.log(
      `%c potato-devtools %c Detected CocosEngine v${hook.CC.ENGINE_VERSION} %c`,
      'background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff',
      'background:#41b883 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff',
      'background:transparent'
    )
  });

}

function connect() {

}

function scan() {

}

function processInstance() {

}

function walk() {

}

function flush() {
  console.log('flush');
}

export function getCustomInstanceDetails() {

}