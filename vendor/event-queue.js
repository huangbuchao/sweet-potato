/**
 * deal with intensive events.
 * give two solution
 */
import Event from './event';
import { inherit } from "shared/util";

function Queue() {
  this.queue = {};
  this.status = 'ready';
}

Queue.prototype = {
  constructor: Queue,

  emitProxy(event, cb) {
    cb ? cb() : this.emit(event);
  },

  kebabEmit(event) {
    //state lock
    if(this.status === 'ready') {
      this.status = 'pending'
      this.emitProxy(event, () => this.status = 'ready');
    }
  },

  flushEmit(event) {
    if(this.queue[event.type]) {
      this.queue[event.type].push(event);
    } else {
      this.queue[event.type] = [event];
    }

    this.emitProxy(event, () => {
      this.queue.forEach(e => this.emit(e));
    });
  }
};

inherit(Queue, Event);

export default Queue;