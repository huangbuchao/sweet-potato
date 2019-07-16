export function disptchThunkify(disptch) {
    return function (act) {
        disptch(act())
    }
}

export function inherit(Child, Parent, ...properties) {
    var Func = function() {};
    Func.prototype = Parent.prototype;
    Child.prototype = new Func();

    Child.prototype._super = Parent;
    Child.prototype.constructor = Child;

    if (properties.length) {
      assign(Child.prototype, ...properties);
    }
  };

  function assign(target) {
    if (target === undefined || target === null) {
      throw new TypeError("Reference right! Type error!");
    }

    var output = Object(target);
    for (var index = 1; index < arguments.length; index++) {
      var source = arguments[index];
      if (source !== undefined && source !== null) {
        for (var key in source) {
          if (source.hasOwnProperty(key)) {
            output[key] = source[key];
          }
        }
      }
    }
    return output;
  }

  //bind is a form of curry
  function bind(toThis) {
    if (typeof this !== "function") {
      throw TypeError("type error, not a function");
    }
    var toThis = this,
    baseArgs = Array.prototype.slice.call(arguments, 1),
    Func = function() {}, //empty function use for prototype inherit
    FinalFunc = function() {
      return toThis.apply(
        Func.isPrototypeOf(this.prototype) ? this : toThis,
        Array.prototype.concat.apply(baseArgs, arguments)
      );
    };

    //if this called with new operator, well use this instead of toThis.
    if (this.prototype) {
      Func.prototype = this.prototype;
    }
    finalFunc.prototype = new Func();

    return FinalFunc;
  }
