//@flow

//deal with intensive events.
//give two solution

import Event from './event';
import { inherit } from "shared/util";

function Queue() {
  this.queue = {};
  this.status = 'ready';
}

Queue.prototype = {
  constructor: Queue,

  kebabEmit(event) {
    //state lock
    if(this.status === 'ready') {
      this.status = 'pending'
      this.emit(event, () => this.status = 'ready');
    }
  },

  flushEmit(event) {
    if(this.queue[event.type]) {
      this.queue[event.type].push(event);
    } else {
      this.queue[event.type] = [event];
    }

    this.emit(event, () => {
      this.queue.forEach(e => this.emit(e));
    });
  }
};

inherit(Queue, Event);

export default Queue;