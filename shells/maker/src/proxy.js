//@flow

const port = chrome.runtime.connect({
  name: "content-script"
});

port.onMessage.addListener(sendMessageToBackend);
window.addEventListener("message", sendMessageToDevtools);
port.onDisconnect.addListener(handleDisconnect);

sendMessageToBackend("init");

function sendMessageToBackend(payload) {
  window.postMessage({
    source: "potato-devtools-proxy",
    payload
  }, "*");
}

function sendMessageToDevtools(e) {
  if(e.data && e.data.source === "potato-devtools-backend") {
    port.postMessage(e.data.payload);
  }
}

function handleDisconnect() {
  window.removeEventListener("message", sendMessageToDevtools);
  sendMessageToBackend("shutdown")
}