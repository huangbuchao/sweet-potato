/**
 * @flow
 */
import io from "socket.io-client";
import { initDevtools } from "frontend";
import Bridge from "agent/bridge";

const port = process.env.PORT || 8098;
const socket = io("http://localhost:" + port);
const $ = document.querySelector.bind(document);
const $hello = $("#hello");

let reload = null;

socket.on("potato-devtools-disconnect-devtools", () => {
  $hello.classList.remove("hidden");
});

socket.on("potato-devtools-init", () => {
  $hello.classList.add("hidden");

  socket.off("potato-message");

  if(reload) return reload();

  initDevtools({
    connect(callback) {
      const wall = {
        listen(func) {
          socket.on("potato-message", data => func(data));
        },
        send(data) {
          console.log("devtools->backend");
          socket.emit("potato-message", data);
        }
      };

      callback(new Bridge(wall));
    },
    onReload(func) {
      reload = func;
    }
  });
});