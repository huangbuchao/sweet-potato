/**
 * @flow
 */
import { isBrowser } from "shared/env";

const inBroswer = isBrowser && window.__POTATO_DEVTOOLS_GLOBAL_HOOK__;
const devtools =
  process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test";
const inCC = !!window.cc;

inBroswer && devtools && inCC
  ? setTimeout(() => {
    window.__POTATO_DEVTOOLS_GLOBAL_HOOK__.emit("init", window.cc);
  })
  : console.log(
    `%c devtool launch failed, expect in broswer && development && CC environment`,
    "background: #e0d3d3 ; padding: 2px; border-radius: 3px 3px 3px 3px;  color: red"
  );