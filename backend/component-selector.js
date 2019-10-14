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
      this.bridge.send("inspect-instance", this.selectedInstance.__POTATO_DEVTOOLS_UID__);
    } else {
      this.bridge.send("stop-component-selector");
    }

    this.stopSelecting();
  }

  canvasMove(e) {
    const el = e.target;

    this.canvasRect = el.getBoundingClientRect();
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

  probeInstance(e) {
    const { left, top, height } = this.canvasRect;
    const p = this.convertVerticalCoordinate(
      height,
      e.clientX - left,
      e.clientY - top
    );

    const qualifiedNodes = this.filterQualifiedNodes(p);

    if (qualifiedNodes.length === 0) return null;

    const sortNodes = qualifiedNodes.sort(
      (a, b) => b.__instanceId - a.__instanceId
    );
    return sortNodes[0];
  }

  //TODO: anchor point;
  //Qualified condition: 1: contained. 2:
  filterQualifiedNodes(p) {
    const values = this.instanceMap.values();
    const nodes = Array.from(values);
    const ratio = this.getDynamicRatio(nodes[0]);

    return nodes.filter(node => {
      const { x, y, width, height } = node;
      const worldPosition = node.parent.convertToWorldSpaceAR({ x, y });
      const rect = { x: worldPosition.x, y: worldPosition.y, width, height };
      return this.isContained(p, rect, ratio);
    });
  }

  getDynamicRatio(instance) {
    const rootInstance = instance.$rootParent;
    const ratioW = this.canvasRect.width / rootInstance.width;
    const ratioH = this.canvasRect.height / rootInstance.height;
    return { ratioW, ratioH };
  }
  //TODO: adjustSize = ...parent.scale * self.scale * self.size.
  //TODO: actualSize = anchor * p * adjustSize.
  isContained(p, { x, y, width, height }, { ratioW, ratioH }) {
    const minX = x - width / 2;
    const maxX = x + width / 2;
    const minY = y - height / 2;
    const maxY = y + height / 2;
    const ratioX = p.x / ratioW;
    const ratioY = p.y / ratioH;
    return minX <= ratioX && maxX >= ratioX && minY <= ratioY && maxY >= ratioY;
  }

  convertVerticalCoordinate(offsetVertical, x, y) {
    return {
      x,
      y: offsetVertical - y
    };
  }
}
