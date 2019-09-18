//@flow

//deal with one-to-many, many-to-one, many-to-many. delegate expect events handler.

import { EventEmitter } from 'events';

export default class EventProxy extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
    this.asyncQueue = [];
  }

  all() {

  }

  any() {

  }

  fail() {

  }

  done() {

  }
}