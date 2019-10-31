require("./build/hook.js");

const target = typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {};

module.exports = {
  connect: function(host, port, { io, showToast, app }) {
    target.__POTATO_DEVTOOLS_HOST__ = host;
    target.__POTATO_DEVTOOLS_PORT__ = port;
    if(io) target.__POTATO_DEVTOOLS_SOCKET__ = io;
    if(showToast) target.__POTATO_DEVTOOLS_TOAST_ = showToast;
    if(app) target.__POTATO_ROOT_INSTANCES__ = Array.isArray(app) ? app : [app];

    require("./build/backend.js");
  },
  init: function(cc) {
    const hook = target.__POTATO_DEVTOOLS_GLOBAL_HOOK__;
    hook.emit("init", cc);
  }
};