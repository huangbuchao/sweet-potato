/**
 * @flow
 */
import io from "socket.io-client";
import { initBackend } from "backend";
import { installToast } from "backend/toast";
import Bridge from "agent/bridge";
import { target } from "shared/env";

const host = "http://localhost:";
const port = process.env.PORT || 8098;
const fullHost = host + port;
const socket = io(fullHost);

function connectedMessage() {
  if (target.__POTATO_DEVTOOLS_TOAST__) {
    target.__POTATO_DEVTOOLS_TOAST__("Remote Devtools Connected", "normal");
  }
}

function disconnectedMessage() {
  if (target.__POTATO_DEVTOOLS_TOAST__) {
    target.__POTATO_DEVTOOLS_TOAST__("Remote Devtools Disconnnected", "error");
  }
}

const bridge = new Bridge({
  listen(func) {
    socket.on("potato-message", data => func(data));
  },
  send(data) {
    socket.emit("potato-message", data);
  }
});

bridge.on("shutdown", () => {
  socket.disconnect();
  disconnectedMessage();
});

// Global disconnect handler. Fires in two cases:
// - after calling above socket.disconnect()
// - once devtools is closed (that's why we need socket.disconnect() here too, to prevent further polling)
socket.on("connect", () => {
  console.log("backend connect");
  console.log("\n______________________________________________")
  connectedMessage();
  initBackend(bridge);
  socket.emit("potato-devtools-init");
});

socket.on("disconnect", () => {
  disconnectedMessage();
  socket.disconnect();
});

// Disconnect socket once other client is connected
socket.on("potato-devtools-disconnect-backend", () => {
  socket.disconnect();
});

installToast(target);
