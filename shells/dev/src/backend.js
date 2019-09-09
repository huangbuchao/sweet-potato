/**
 * @flow
 */

import { initBackend } from "backend";
import Bridge from "agent/bridge";

const bridge = new Bridge({
  listen(fnc) {
    window.addEventListener("message", e => fnc(e.data));
  },
  send(data) {
    console.log("backend -> devtools: ", data);
    window.parent.postMessage(data, "*");
  }
});

initBackend(bridge);
