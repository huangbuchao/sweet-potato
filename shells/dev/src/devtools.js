/**
 * @flow
 */
import { initDevtools } from "frontend";
import Bridge from "agent/bridge";

const target = document.getElementById("target");
const targetWindow = target.contentWindow;

target.src = "./target/index.html";
target.onload = () => {
  initDevtools({
    connect(cb) {
      inject("../build/backend.js").then(() => {
        cb(
          new Bridge({
            listen(fn) {
              targetWindow.parent.addEventListener("message", ev =>
                fn(ev.data)
              );
            },
            send(data) {
              console.log("devtool->backend", data);
              targetWindow.postMessage(data, "*");
            }
          })
        );
      });
    },
    onReload(reloadFunc) {
      target.onload = reloadFunc;
    }
  });
};
//
function inject(src) {
  return new Promise(resolve => {
    const done = resolve;
    if (!src || src === "false") {
      return done();
    }
    const script = target.contentDocument.createElement("script");
    script.src = src;
    script.onload = done;
    target.contentDocument.body.appendChild(script);
  });
}
