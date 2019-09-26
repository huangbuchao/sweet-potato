/**
 * @flow
 */
import { target, isBrowser } from "shared/env";

const inBroswer = isBrowser && target.__POTATO_DEVTOOLS_GLOBAL_HOOK__;
const devtools =
  process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test";
const inCC = !!target.cc;

// inBroswer && devtools && inCC
//   ? setTimeout(() => {
//     target.__POTATO_DEVTOOLS_GLOBAL_HOOK__.emit("init", target.cc);
//   })
//   : console.log(
//     `%c devtool launch failed, expect in broswer && development mode && cocos environment`,
//     "background: #e0d3d3 ; padding: 2px; border-radius: 3px 3px 3px 3px;  color: red"
//   );

(function(window) {
  if(!window.__POTATO_DEVTOOLS_LAUNCHER__) {
    window.__POTATO_DEVTOOLS_LAUNCHER__ = function () {
      inBroswer && devtools && inCC
        ? target.__POTATO_DEVTOOLS_GLOBAL_HOOK__.emit("init", target.cc)
        : console.log(
          `%c devtool launch failed, expect in broswer && development mode && cocos environment`,
          "background: #e0d3d3 ; padding: 2px; border-radius: 3px 3px 3px 3px;  color: red"
        );
    }
  }
  window.__POTATO_DEVTOOLS_LAUNCHER__();
})(window);