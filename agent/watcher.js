/**
 * @flow
 */

export default class Watcher {
  constructor(target) {
    this.setters = {};
    this.register(target);
  }

  register(target) {
    Object.keys(target).forEach(key => {
      Object.defineProperty(this, key, {
        configurable: false,
        get: () => target[key],
        set: (value) => {
          target[key] = value;
          if(this.setters[key]) {
            this.setters[key].forEach(fnc => fnc(value));
          }
        }
      });
    });
  }

  watch(key, cb) {
    let value = this.setters[key];
    if(value) {
      value.push(cb);
    }else{
      this.setters[key] = [cb];
    }
  }

  destroy() {
    this.setters = null;
  }
}
