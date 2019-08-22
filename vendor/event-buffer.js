/**
 * https://github.com/huangbuchao/Custom-event-model
 */

function EventTarget() {
  this.handlers = {};
}

EventTarget.prototype = {
  constructor: EventTarget,

  _buffer: [],

  _replayBuffer: function(event) {
    let buffer = this._buffer;
    this._buffer = [];
    for (let i = 0; i < buffer.length; i++) {
      let args = buffer[i];
      args[0] === event ? this.emit.apply(this, args) : this._buffer.push(args);
    }
  },

  on: function(type, handler, context) {
    var emp = Object.create(null);
    var funcBound = handler.bind(context || emp);
    if (this.handlers[type]) {
      this.handlers[type].push(funcBound);
    } else {
      this.handlers[type] = [funcBound];
      this._buffer.push(type);
    }
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
    let listeners = this.handlers[event.type];
    if (listeners) {
      if (this.handlers[event.type] instanceof Array) {
        var handlers = this.handlers[event.type];
        for (var index = 0; index < handlers.length; index++) {
          handlers[index](arguments);
        }
      }
    } else {
      let args = Array.prototype.slice.call(arguments);
      this._buffer.push(args);
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

module.exports = EventTarget;
