/**
 * @flow
 */

const LEFT = "ArrowLeft";
const UP = "ArrowUp";
const RIGHT = "ArrowRight";
const DOWN = "ArrowDown";
const ENTER = "Enter";
const DEL = "Delete";
const BACKSPACE = "Backspace";

const activeInstances = [];

function processEvent(event, type) {
  if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") {
    return;
  }

  const modifiers = [];
  if(event.ctrlKey || event.metaKey) modifiers.push('ctrl');
  if(event.shiftKey) modifiers.push('shift');
  if(event.altKey) modifiers.push('alt');

  const info = {
    key: event.key,
    code: event.code,
    modifiers: modifiers.join('+')
  };

  let result = true;
  activeInstances.forEach(option => {
    if(option[type]) {
      const res = option[type].call(option.vm, info);
      if(!res) {
        result = false;
      }
    }
  });

  if(!result) {
    event.preventDefault();
  }
}

document.addEventListener("keydown", event => {
  processEvent(event, 'onKeyDown');
});

export default function() {
  return {
    mounted(options) {
      activeInstances.push({
        vm: this,
        ...options
      });
    },
    destroyed() {
      const i = activeInstances.findIndex(o => o.vm === this);
      if (i >= 0) {
        activeInstances.splice(i, 1);
      }
    }
  };
}
