/**
 * @flow
 */

import { highLight, unHighLight } from "./highlighter";
import { isBrowser } from "shared/env";
import throttle from "lodash.throttle";

export default class ComponentSelector {
  constructor(bridge, instanceMap) {
    this.bridge = bridge;
    this.instanceMap = instanceMap;
    this.bindMethods();
    this.canvas = null;

    bridge.on("start-component-selector", this.startSelecting);
    bridge.on("stop-component-selector", this.stopSelecting);
  }

  startSelecting() {
    if (!isBrowser) return;
    window.addEventListener("mouseover", this.elementMouseOver, true);
    window.addEventListener("click", this.elementClicked, true);
    window.addEventListener("mouseout", this.cancelEvent, true);
    window.addEventListener("mouseenter", this.cancelEvent, true);
    window.addEventListener("mouseleave", this.cancelEvent, true);
    window.addEventListener("mousedown", this.cancelEvent, true);
    window.addEventListener("mouseup", this.cancelEvent, true);
  }

  stopSelecting() {
    if (!isBrowser) return;
    window.removeEventListener("mouseover", this.elementMouseOver, true);
    window.removeEventListener("click", this.elementClicked, true);
    window.removeEventListener("mouseout", this.cancelEvent, true);
    window.removeEventListener("mouseenter", this.cancelEvent, true);
    window.removeEventListener("mouseleave", this.cancelEvent, true);
    window.removeEventListener("mousedown", this.cancelEvent, true);
    window.removeEventListener("mouseup", this.cancelEvent, true);
    this.canvas.removeEventListener("mousemove", this.canvasMove, true);

    unHighLight();
  }

  elementMouseOver(e) {
    this.cancelEvent(e);

    const el = e.target;

    if (el.tagName !== "CANVAS") return;
    this.canvas = el;

    this.canvas.addEventListener("mousemove", this.canvasMove, true);
  }

  elementClicked(e) {
    this.cancelEvent(e);

    if (this.selectedInstance) {
      this.bridge.send("inspect-instance", this.selectedInstance.__instanceId);
    } else {
      this.bridge.send("stop-component-selector");
    }

    this.stopSelecting();
  }

  canvasMove(e) {
    const el = e.target;
    console.log("move: ", e, el.getBoundingClientRect());
    this.selectedInstance = this.probeInstance(e);

    unHighLight();

    if (this.selectedInstance) {
      highLight(this.selectedInstance);
    }
  }

  cancelEvent(e) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }

  //avoid rebind
  bindMethods() {
    this.startSelecting = this.startSelecting.bind(this);
    this.stopSelecting = this.stopSelecting.bind(this);
    this.elementMouseOver = this.elementMouseOver.bind(this);
    this.elementClicked = this.elementClicked.bind(this);
    this.canvasMove = throttle(this.canvasMove.bind(this), 30);
  }

  probeInstance() {
    //
  }
}
