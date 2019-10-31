#!/usr/bin/env node
const electron = require("electron");
const { spawn } = require("child_process");

const args = [require.resolve("./app")].concat(process.argv.slice(2));

const child = spawn(
  electron,
  args,
  {
    stdio: "inherit",
    windowsHide: false
  }
);

child.on("close", function(code) {
  process.exit(code);
});

const handleTerminationSignal = function (signal) {
  process.on(signal, function signalHandler() {
    if (!child.killed) {
      child.kill(signal)
    }
  })
}

handleTerminationSignal("SIGINT");
handleTerminationSignal("SIGTERM");