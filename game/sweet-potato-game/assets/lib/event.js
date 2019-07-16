export default function EventTarget() {}

EventTarget.prototype = {
  constructor: EventTarget,

  handlers: {},

  on: function(type, handler, context) {
    if (typeof this.handlers[type] === "undefined") {
      this.handlers[type] = [];
    }
    var emp = Object.create(null);
    var funcBound = handler.bind(context || emp);
    this.handlers[type].push(funcBound);
    return funcBound;
  },

  once: function(type, handler, context) {
    let handlerOnce = function() {
      handler.apply(this, arguments);
      this.off(type, handler);
    };
    return this.on(type, handlerOnce, context);
  },

  emit: function(event) {
    if (!this.target) {
      event.target = this;
    }

    if (this.handlers[event.type] instanceof Array) {
      var handlers = this.handlers[event.type];
      for (var index = 0; index < handlers.length; index++) {
        handlers[index](event);
      }
    }
  },

  off: function(type, handler) {
    if (this.handlers[type] instanceof Array) {
      var handlers = this.handlers[type];
      for (var index = 0; index < handlers.length; index++) {
        if (handlers[index] === handler) {
          break;
        }
      }
      handlers.splice(index, 1);
    }
  }
};
