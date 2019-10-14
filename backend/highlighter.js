/**
 * @flow
 */

import { isBrowser } from "shared/env";

let overlay;
let overlayContent;

function init() {
  if (overlay || !isBrowser) return;
  overlay = document.createElement("div");
  overlay.style.backgroundColor = "rgba(104, 182, 255, 0.35)";
  overlay.style.position = "fixed";
  overlay.style.zIndex = "99999999999999";
  overlay.style.pointerEvents = "none";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.borderRadius = "3px";
  overlayContent = document.createElement("div");
  overlayContent.style.backgroundColor = "rgba(104, 182, 255, 0.9)";
  overlayContent.style.fontFamily = "monospace";
  overlayContent.style.fontSize = "80%";
  overlayContent.style.padding = "2px 3px";
  overlayContent.style.borderRadius = "3px";
  overlayContent.style.color = "white";
  overlay.appendChild(overlayContent);
}

export function highLight(instance) {
  if(!instance) return;

  const rect = getInstanceRect(instance);

  if(!isBrowser) {
    //TODO: electron env
    return;
  }

  init();

  if(rect) {
    const content = [];
    const name = instance.name;
    if (name) {
      const pre = document.createElement('span')
      pre.style.opacity = '0.6'
      const text = document.createTextNode(name)
      const post = document.createElement('span')
      post.style.opacity = '0.6'
      content.push(pre, text, post)
    }
    showOverlay(rect, content);
  }
}

export function unHighLight() {
  if(overlay && overlay.parentNode) {
    document.body.removeChild(overlay);
  }
}

export function getInstanceRect(instance) {
  if(!isBrowser) return; //TODO

  const instanceRect = {};
  const rootInstance = instance.$rootParent;

  const canvas = document.getElementsByTagName('canvas');
  const canvasRect = canvas[0].getBoundingClientRect()

  //TODO: anchor transform.
  //TODO: rotation solution.
  const { width, height } = instance;
  const {
    __POTATO_DEVTOOLS_SELECTOR_SCALEX__,
    __POTATO_DEVTOOLS_SELECTOR_SCALEY__
  } = instance;
  const widthT = width * __POTATO_DEVTOOLS_SELECTOR_SCALEX__;
  const heightT = height * __POTATO_DEVTOOLS_SELECTOR_SCALEY__;
  const { x, y } = instance.parent.convertToWorldSpaceAR({ x: instance.x, y: instance.y });

  const widthRatio = canvasRect.width / (rootInstance.width * rootInstance.__POTATO_DEVTOOLS_SELECTOR_SCALEX__);
  const heightRatio = canvasRect.height / (rootInstance.height * rootInstance.__POTATO_DEVTOOLS_SELECTOR_SCALEY__);
  const relativeY = (rootInstance.height * rootInstance.__POTATO_DEVTOOLS_SELECTOR_SCALEY__) - y;

  instanceRect.width = widthT * widthRatio;
  instanceRect.height = heightT * heightRatio;
  instanceRect.left = x * widthRatio + canvasRect.left - instanceRect.width / 2;
  instanceRect.top = relativeY * heightRatio + canvasRect.top - instanceRect.height / 2;

  return instanceRect;
}

function showOverlay({ width = 0, height = 0, top = 0, left = 0 }, content = []) {
  if(!isBrowser) return;

  overlay.style.width = ~~width + 'px';
  overlay.style.height = ~~height + 'px';
  overlay.style.top = ~~top + 'px';
  overlay.style.left = ~~left + 'px';

  overlayContent.innerHTML = '';
  content.forEach(child => overlayContent.appendChild(child));

  document.body.appendChild(overlay);
}
