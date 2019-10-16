/* eslint-disable no-unused-vars */
//@flow

// This is the devtools script

let panelLoaded = false;
let panelShown = false;
let created = false;
let checkCount = 0;

chrome.devtools.network.onNavigated.addListener(createPanelIfHasCC);
const clearCCInterval = setInterval(createPanelIfHasCC, 1000);
createPanelIfHasCC();

function createPanelIfHasCC() {
  if (created || checkCount++ > 10) {
    return;
  }

  panelLoaded = false;
  panelShown = false;

  chrome.devtools.inspectedWindow.eval(
    "!!(window.__POTATO_DEVTOOLS_GLOBAL_HOOK__.cc)",
    function(hasCC) {
      if (!hasCC || created) {
        return;
      }
      clearInterval(clearCCInterval);
      created = true;
      chrome.devtools.panels.create(
        "Potato",
        "icons/128.png",
        "devtools.html",
        panel => {
          // panel loaded
          panel.onShown.addListener(onPanelShown);
          panel.onHidden.addListener(onPanelHidden);
        }
      );
    }
  );
}

chrome.runtime.onMessage.addListener(request => {
  if (request === "potato-panel-load") {
    panelLoaded = true;
  }
});

function onPanelHidden() {
  chrome.runtime.sendMessage("potato-panel-hidden");
  panelShown = false;
}

function onPanelShown() {
  chrome.runtime.sendMessage("potato-panel-shown");
  panelShown = true;
}
