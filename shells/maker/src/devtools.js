//@flow

import { initDevtools } from "frontend";
import Bridge from "agent/bridge";

initDevtools({
  connect(cb) {
    injectScript(chrome.runtime.getURL("build/backend.js"), () => {
      const port = chrome.runtime.connect({
        name: "" + chrome.devtools.inspectedWindow.tabId
      });

      let disconnected = false;
      port.onDisconnect.addListener(() => {
        disconnected = true;
      });

      cb(new Bridge({
        lisene(fn) {
          port.onMessage.addListener(fn);
        },
        send(data) {
          if(!disconnected) {
            port.sendMessage(data);
          }
        }
      }));
    });
  },
  onReload(cb) {
    chrome.devtools.network.onNavigated.addListener(cb);
  }
});

function injectScript(scriptName, cb) {
  const source = `
    (function() {
      var script = document.constructor.prototype.createElement.call(document, 'script');
      script.src = "${scriptName}";
      document.documentElement.appendChild(script);
      script.parentNode.removeChild(script);
    })()
  `;

  chrome.devtools.inspectedWindow.eval(source, function (res, err) {
    if (err) {
      console.log(err);
    }
    cb();
  });
}