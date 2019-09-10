/**
 * @flow
 */
import { target } from "shared/env";

const hook = target.__POTATO_DEVTOOLS_GLOBAL_HOOK__;
//const rootInstances = [];
let bridge;

export function initBackend(_bridge) {
  bridge = _bridge;
  bridge.send('initCC', hook.CC.ENGINE_VERSION);
}