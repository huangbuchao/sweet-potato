/**
 * @flow
 */
import { target } from "shared/env";

const hook = target.__POTATO_DEVTOOLS_GLOBAL_HOOK__;
//const rootInstances = [];
let bridge;

export function initBackend(_bridge) {
  bridge = _bridge;

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