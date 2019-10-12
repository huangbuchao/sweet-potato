/* eslint-disable no-unused-vars */
//@flow

// central message hub. inspectPane--proxy--devtools.

const ports = {};

function isNumeric(str) {
  return +str + '' === str;
}

chrome.runtime.onConnect.addListener(port => {
  let name;
  let tab;

  if(isNumeric(port.name)) {
    tab = port.name;
    name = "devtools";
    injectProxy(+port.name);
  }else{
    tab = port.sender.tab.id;
    name = "backend";
  }

  if(!ports[tab]) {
    ports[tab] = {
      devtools: null,
      backend: null
    }
  }

  ports[tab][name] = port;

  if(ports[tab].devtools && ports[tab].backend) {
    pipe(tab, ports[tab].devtools, ports[tab].backend);
  }
});

function injectProxy(tabId) {
  chrome.tabs.executeScript(tabId, {
    file: "./build/proxy.js"
  }, function(res) {
    if(!res) {
      ports[tabId].devtools.postMessage("proxy-fail");
    } else {
      console.log("injected proxy to tab " + tabId);
    }
  });
}

function pipe(id ,one, two) {
  one.onMessage.addListener(lOne);
  function lOne(message) {
    if(message.event === "log") {
      return console.log("tab " + id, message.payload);
    }
    console.log("devtools->backend", message);
    two.postMessage(message);
  }

  two.onMessage.addListener(lTwo);
  function lTwo(message) {
    if(message.event === "log") {
      return console.log("tab " + id, message.payload);
    }
    console.log("backend->devtools", message);
    one.postMessage(message);
  }

  function shutdown() {
    console.log("tab " + id + " disconnected.");
    one.onMessage.removeListener(lOne);
    two.onMessage.removeListener(lTwo);
    one.disconnect();
    two.disconnect();
    ports[id] = null;
  }

  one.onDisconnect.addListener(shutdown);
  two.onDisconnect.addListener(shutdown);

  console.log("tab " + id + " connected.");
}

chrome.runtime.onMessage.addListener((req, sender) => {
  if(sender.tab && req.ccDetected) {
    chrome.browserAction.setIcon({
      tabId: sender.tab.id,
      path: {
        16: "icons/16.png",
        48: "icons/48.png",
        128: "icons/128.png"
      }
    });

    chrome.browserAction.setPopup({
      tabId: sender.tab.id,
      popup: req.devtoolsEnabled ? "popup/enabled.html" : "popup/disabled.html"
    });
  }
});