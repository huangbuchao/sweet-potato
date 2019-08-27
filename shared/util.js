/**
 * @flow
 */

export function getType(target) {
  return Object.prototype.toString
    .call(target)
    .replace(/^\[object (.+)\]$/, "$1")
    .toLowerCase();
}

export const UNDEFINED = "__vue_devtool_undefined__";
export const INFINITY = "__vue_devtool_infinity__";
export const NEGATIVE_INFINITY = "__vue_devtool_negative_infinity__";
export const NAN = "__vue_devtool_nan__";

export const SPECIAL_TOKENS = {
  true: true,
  false: false,
  undefined: UNDEFINED,
  null: null,
  "-Infinity": NEGATIVE_INFINITY,
  Infinity: INFINITY,
  NaN: NAN
};

export function disptchThunkify(disptch) {
  return function(act) {
    disptch(act());
  };
}

export function inherit(Child, Parent) {
  var Func = function() {};
  Func.prototype = Parent.prototype;
  Child.prototype = new Func();

  Child.prototype._super = Parent;
  Child.prototype.constructor = Child;
}
