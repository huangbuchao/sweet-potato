//@flow

import { isFirefox } from "shared/env";
import { installToast } from "backend/toast";

window.addEventListener("message", e => {
  if(e.source == window && e.data.source.ccDetected) {
    chrome.runtime.sendMessage(e.data);
  }
});

function detect(win) {
  setTimeout(() => {
    const ccDetected = Boolean(window.cc);

    if(ccDetected) {
      win.postMessage({
        devtoolsEnabled: window.cc && window.cc.director,
        ccDetected
      }, "*");
    }

    return;
  }, 150);
}

if(document instanceof HTMLDocument) {
  injectScript(detect);
  injectScript(installToast);
}

function injectScript(fn) {
  const source = ";(" + fn.toString() + ")(window)";

  if(isFirefox) {
    window.eval(source);
  }else{
    const script = document.createElement("script");
    script.textContent = source;
    document.documentElement.appendChild(script);
    script.parentNode.removeChild(script);
  }
}