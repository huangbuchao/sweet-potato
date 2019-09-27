/**
 * @flow
 */

import { highLight, unHighLight } from "./highlighter";
import { isBrowser } from "shared/env";

export default class ComponentSelector {
  constructor(bridge, instanceMap) {
    this.bridge = bridge;
    this.instanceMap = instanceMap;
    this.bindMethods();

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

    unHighLight();
  }

  elementMouseOver(e) {
    this.cancelEvent();

    const el = e.target;

    this.selectedInstance = this.probeInstance(el);

    unHighLight();

    if(this.selectedInstance) {
      highLight(this.selectedInstance);
    }
  }

  elementClicked(e) {
    this.cancelEvent(e);

    if(this.selectedInstance) {
      this.bridge.send('inspect-instance', this.selectedInstance.__instanceId);
    }else{
      this.bridge.send('stop-component-selector');
    }

    this.stopSelecting();
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
  }

  probeInstance() {
    //
  }
}
