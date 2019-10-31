#!/usr/bin/env node
const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const fs = require("fs");
const path = require("path");

const port = process.env.PORT || 8098;

app.get("/", (req, res) => {
  const backendContent = fs.readFileSync(
    path.join(__dirname, "./build/backend.js"),
    "utf-8"
  );
  const hookContent = fs.readFileSync(
    path.join(__dirname, "./build/hook.js"),
    "utf-8"
  );
  const launcherContent = fs.readFileSync(
    path.join(__dirname, "./build/mock-launcher.js"),
    "utf-8"
  );
  res.send([hookContent, backendContent, launcherContent].join("\n"));
});

io.on("connection", function(socket) {
  socket.broadcast.emit("potato-devtools-disconnect-backend");

  socket.on("potato-devtools-init", () => {
    socket.broadcast.emit("potato-devtools-init");
  });

  socket.on("disconnect", reason => {
    if(reason.indexOf("client")) {
      socket.broadcast.emit("potato-devtools-disconnect-devtools");
    }
  });

  socket.on("potato-message", data => {
    socket.broadcast.emit("potato-message", data);
  });
});

http.listen(port, "0.0.0.0", () => {
  console.log("listening on 0.0.0.0:" + port);
});