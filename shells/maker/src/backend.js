//@flow

import { initBackend } from "backend";
import Bridge from "agent/bridge";

window.addEventListener("message", handshake);

function handshake({ data }) {
  if(data.source === "potato-devtools-proxy" && data.payload === "init") {
    window.removeEventListener("message", handshake);

    let listeners = [];
    const bridge = new Bridge({
      listen (fn) {
        let listener = evt => {
          if(evt.data.source === "potato-devtools-proxy" && evt.data.payload) {
            fn(evt.data.payload);
          }
        };
        window.addEventListener("message", listener);
        listeners.push(listener);
      },
      send (data) {
        window.postMessage({
          source: "potato-devtools-backend",
          payload: data
        }, "*");
      }
    });

    bridge.on("shutdown", () => {
      listeners.forEach(l => {
        window.removeEventListener("message", l);
      });
      listeners = [];
    });

    initBackend(bridge);
  }
}