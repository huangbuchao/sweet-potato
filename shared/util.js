/* eslint-disable no-unused-vars */
/**
 * @flow
 */
import path from "path";

import * as CircularJSON from "vendor/transfer";
import { instanceMap, getCustomInstanceDetails } from "backend";
// import SharedData from "./shared-data";
// import { isChrome } from "./env";

/**
 * /////////////////////////////////////////////////////////////////////
 * format with a cache
 * /////////////////////////////////////////////////////////////////////
 */

function cached(func) {
  const cache = Object.create(null);
  return function cachedFunc(str) {
    let hit = cache[str];
    return hit || (cache[str] = func(str));
  };
}

const classifyREG = /(?:^|[-_/])(\w)/g;
export const classify = cached(str => {
  return str && str.replace(classifyREG, toUpper);
});

const camelREG = /-(\w)/g;
export const camelize = cached(str => {
  return str && str.replace(camelREG, toUpper);
});

const kebabizeREG = /([a-z0-9])([A-Z])/g;
export const kebabize = cached(str => {
  return (
    str &&
    str
      .replace(kebabizeREG, (_, lowerCaseCharacter, upperCaseCharacter) => {
        return `${lowerCaseCharacter}-${upperCaseCharacter}`;
      })
      .toLowerCase()
  );
});

function toUpper(_, c) {
  return c ? c.toUpperCase() : "";
}

export function getComponentDisplayName(originalName, style = "class") {
  switch (style) {
    case "class":
      return classify(originalName);
    case "kebab":
      return kebabize(originalName);
    case "original":
    default:
      return originalName;
  }
}

export function inDoc(node) {
  if (!node) return false;
  var doc = node.ownerDocument.documentElement;
  var parent = node.parentNode;
  return (
    doc === node ||
    doc === parent ||
    !!(parent && parent.nodeType === 1 && doc.contains(parent))
  );
}

/**
 * /////////////////////////////////////////////////////////////////////
 * Stringify/parse data using CircularJSON.
 * /////////////////////////////////////////////////////////////////////
 */

export const UNDEFINED = "__potato_devtool_undefined__";
export const INFINITY = "__potato_devtool_infinity__";
export const NEGATIVE_INFINITY = "__potato_devtool_negative_infinity__";
export const NAN = "__potato_devtool_nan__";

export const SPECIAL_TOKENS = {
  true: true,
  false: false,
  undefined: UNDEFINED,
  null: null,
  "-Infinity": NEGATIVE_INFINITY,
  Infinity: INFINITY,
  NaN: NAN
};

export const MAX_STRING_SIZE = 10000;
export const MAX_ARRAY_SIZE = 5000;

export function specialTokenToString(value) {
  if (value === null) {
    return "null";
  } else if (value === UNDEFINED) {
    return "undefined";
  } else if (value === NAN) {
    return "NaN";
  } else if (value === INFINITY) {
    return "Infinity";
  } else if (value === NEGATIVE_INFINITY) {
    return "-Infinity";
  }
  return false;
}

/**
 * /////////////////////////////////////////////////////////////////////
 * to prevent stack overflow for each serialization
 * /////////////////////////////////////////////////////////////////////
 */

class EncodeCode {
  constructor() {
    this.map = new Map();
  }

  cache(data, factory) {
    const res = this.map.get(data);
    if (res) {
      return res;
    } else {
      const result = factory(data);
      this.map.set(data, result);
      return result;
    }
  }

  clear() {
    this.map.clear();
  }
}

const encodeCache = new EncodeCode();

export function stringify(data) {
  encodeCache.clear();
  return CircularJSON.stringify(data, replacer);
}

function replacer(key) {
  const val = this[key];
  const type = typeof val;
  if (Array.isArray(val)) {
    const l = val.length;
    if (l > MAX_ARRAY_SIZE) {
      return {
        _isArray: true,
        length: l,
        items: val.slice(0, MAX_ARRAY_SIZE)
      };
    }
    return val;
  } else if (typeof val === "string") {
    if (val.length > MAX_STRING_SIZE) {
      return (
        val.substr(0, MAX_STRING_SIZE) + `... (${val.length} total length)`
      );
    } else {
      return val;
    }
  } else if (type === "undefined") {
    return UNDEFINED;
  } else if (val === Infinity) {
    return INFINITY;
  } else if (val === -Infinity) {
    return NEGATIVE_INFINITY;
  } else if (type === "function") {
    return getCustomFunctionDetails(val);
  } else if (type === "symbol") {
    return `[native Symbol ${Symbol.prototype.toString.call(val)}]`;
  } else if (val !== null && type === "object") {
    const proto = Object.prototype.toString.call(val);
    if (proto === "[object Map]") {
      return encodeCache.cache(val, getCustomMapDetails(val));
    } else if (proto === "[object Set]") {
      return encodeCache.cache(val, () => getCustomSetDetails(val));
    } else if (proto === "[object RegExp]") {
      return `[native RegExp ${RegExp.prototype.toString.call(val)}]`;
    } else if (proto === "[object Date]") {
      return `[native Date ${Date.prototype.toString.call(val)}]`;
    } else if(val._isNode) {
      return encodeCache.cache(val, getCustomInstanceDetails(val));
    }
  } else if (Number.isNaN(val)) {
    return NAN;
  }

  return sanitize(val);
}

/**
 * /////////////////////////////////////////////////////////////////////
 * *** tranform display style(format)
 * /////////////////////////////////////////////////////////////////////
 */

export function getCustomFunctionDetails(fnc) {
  let string = "";
  let matches = null;
  try {
    string = Function.prototype.toString.call(fnc);
    matches = String.prototype.match.call(string, /\([\s\S]*?\)/);
  } catch (error) {
    //
  }

  const match = matches && matches[0];
  const args =
    typeof match === "string"
      ? `(${match.substr(1, match.length - 2).split(",").map(s => s.trim()).join(", ")})`
      : "(?)";
  const name = typeof fnc.name === "string" ? fnc.name : "";

  return {
    _custom: {
      type: "funciton",
      display: `<span>f</span> ${escape(name)}${args}`
    }
  };
}

export function getCustomMapDetails(val) {
  const list = [];
  val.forEach((value, key) => {
    list.push({
      key,
      value
    });
  });

  return {
    _custom: {
      type: "map",
      display: "Map",
      readOnly: true,
      fields: {
        abstract: true
      }
    }
  };
}

export function getCustomSetDetails(val) {
  const list = Array.from(val);
  return {
    _custom: {
      type: "set",
      display: `Set[${list.length}]`,
      value: list,
      readOnly: true
    }
  };
}

export function parse(data, revive) {
  return revive ? CircularJSON.parse(data, reviver) : CircularJSON.parse(data);
}

const specialTypeRE = /^\[native (\w+) (.*)\]$/;
const symbolRE = /^\[native Symbol Symbol\((.*)\)\]$/;

function reviver(key, val) {
  if (val === UNDEFINED) {
    return undefined;
  } else if (val === INFINITY) {
    return Infinity;
  } else if (val === NEGATIVE_INFINITY) {
    return -Infinity;
  } else if (val === NAN) {
    return NaN;
  } else if (val && val._custom) {
    if (val._custom.type === "component") {
      return instanceMap.get(val._custom.id);
    } else if (val._custom.type === "map") {
      return reviveMap(val);
    } else if (val._custom.type === "set") {
      return reviveSet(val);
    }
  } else if (symbolRE.test(val)) {
    const [, string] = symbolRE.exec(val);
    return Symbol.for(string);
  } else if (specialTypeRE.test(val)) {
    const [, type, string] = specialTypeRE.exec(val);
    return new window[type](string);
  } else {
    return val;
  }
}

export function reviveMap(val) {
  const result = new Map();
  const list = val._custom.value;
  for (let i = 0; i < list.length; i++) {
    const { key, value } = list[i];
    result.set(key, reviver(null, value));
  }
  return result;
}

export function reviveSet(val) {
  const result = new Set();
  const list = val._custom.value;
  for (let i = 0; i < list.length; i++) {
    const value = list[i];
    result.add(reviver(null, value));
  }
  return result;
}

/**
 * /////////////////////////////////////////////////////////////////////
 * Sanitize data to be posted to the other side.
 * Since the message posted is sent with structured clone,
 * need to filter out any types that might cause an error.
 * /////////////////////////////////////////////////////////////////////
 */

function sanitize(data) {
  if(
    !isPrimitive(data) &&
    !Array.isArray(data) &&
    !isPlainObject(data)
  ) {
    return Object.prototype.toString.call(data);
  } else {
    return data;
  }
}

export function isPlainObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

export function isPrimitive(value) {
  if(value === null) {
    return true;
  }
  const type = typeof value;
  return (type === 'string' || type === 'number' || type === 'boolean');
}

/**
 * /////////////////////////////////////////////////////////////////////
 * Searches a key or value in the object, with a maximum deepness.
 * Map containing the search result to prevent stack overflow
 * by walking on the same object multiple times.
 * /////////////////////////////////////////////////////////////////////
 */

const SEARCH_MAX_DEPTH = 10;

export function searchDeepInObject(obj, searchTerm) {
  const seen = new Map();
  const result = internalSearchObject(obj, searchTerm.toLowerCase(), seen, 0);
  seen.clear();
  return result;
}

export function internalSearchObject(obj, searchTerm, seen, depth) {
  if(depth > SEARCH_MAX_DEPTH) {
    return false;
  }

  let match = false;
  let key, value;
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    key = keys[i];
    value = obj[key];
    match = internalSearchCheck(searchTerm, key, value, seen, depth + 1);
    if(match) {
      break;
    }
  }
  return match;
}

export function internalSearchArray(array, searchTerm, seen, depth) {
  if (depth > SEARCH_MAX_DEPTH) {
    return false
  }
  let match = false
  let value
  for (let i = 0; i < array.length; i++) {
    value = array[i]
    match = internalSearchCheck(searchTerm, null, value, seen, depth + 1)
    if (match) {
      break
    }
  }
  return match
}

export function internalSearchCheck(searchTerm, key, value, seen, depth) {
  let match = false;
  let result;
  if(key === '_custom') {
    key = value.display;
    value = value.value;
  }

  (result = specialTokenToString(value)) && (value = result);

  if(key && compare(key, searchTerm)) {
    match = true;
    seen.set(value, true);
  }else if(seen.has(value)) {
    match = seen.get(value);
  }else if(Array.isArray(value)) {
    seen.set(value, null);
    match = internalSearchArray(value, searchTerm, seen, depth);
    seen.set(value, match);
  }else if(isPlainObject(value)) {
    seen.set(value, null);
    match = internalSearchObject(value, searchTerm, seen, depth);
    seen.set(value, match);
  }else if(compare(value, searchTerm)) {
    match = true;
    seen.set(value, true);
  }

  return match;
}

function compare(value, searchTerm) {
  return ('' + value).toLowerCase().indexOf(searchTerm) !== -1;
}

/**
 * /////////////////////////////////////////////////////////////////////
 * ********** escap ****** transform **********************************
 * /////////////////////////////////////////////////////////////////////
 */

const ESC = {
  "<": "&lt",
  ">": "&gt",
  '"': "&quot",
  "&": "&amp"
};

export function escape(s) {
  return s.replace(/[<>&"]/, escapeChar);
}

function escapeChar(match) {
  return ESC[match] || match;
}

/**
 * /////////////////////////////////////////////////////////////////////
 * *** copy content to clipboard
 * /////////////////////////////////////////////////////////////////////
 */

export function copyToClipboard(state) {
  if (typeof document === "undefined") return;
  const dummyTextArea = document.createElement("textArea");
  dummyTextArea.textContent = stringify(state);
  document.body.appendChild(dummyTextArea);
  dummyTextArea.select();
  document.execCommand('copy');
  document.body.removeChild(dummyTextArea);
}

/**
 * /////////////////////////////////////////////////////////////////////
 * *** tools
 * /////////////////////////////////////////////////////////////////////
 */

export function sortByKey(state) {
  return state && state.slice().sort((a, b) => {
    if(a.key < b.key) return -1;
    if(a.key > b.key) return 1;
    return 0;
  });
}

export function get(object, path) {
  const sections = Array.isArray(path) ? path : path.split(".");
  for (let i = 0; i < sections.length; i++) {
    object = object[sections[i]];
    if (!object) {
      return undefined;
    }
  }
  return object;
}

export function set (object, path, value, cb = null) {
  const sections = Array.isArray(path) ? path : path.split('.')
  while (sections.length > 1) {
    object = object[sections.shift()]
  }
  const field = sections[0]
  if (cb) {
    cb(object, field, value)
  } else {
    object[field] = value
  }
}

export function has (object, path, parent = false) {
  if (typeof object === 'undefined') {
    return false
  }

  const sections = Array.isArray(path) ? path : path.split('.')
  const size = !parent ? 1 : 2
  while (object && sections.length > size) {
    object = object[sections.shift()]
  }
  return object != null && object.hasOwnProperty(sections[0])
}

/**
 * /////////////////////////////////////////////////////////////////////
 * ***
 * /////////////////////////////////////////////////////////////////////
 */

export function scrollIntoView (scrollParent, el, center = true) {
  const parentTop = scrollParent.scrollTop
  const parentHeight = scrollParent.offsetHeight
  const elBounds = el.getBoundingClientRect()
  const parentBounds = scrollParent.getBoundingClientRect()
  const top = elBounds.top - parentBounds.top + scrollParent.scrollTop
  const height = el.offsetHeight
  if (center) {
    scrollParent.scrollTop = top + (height - parentHeight) / 2
  } else if (top < parentTop) {
    scrollParent.scrollTop = top
  } else if (top + height > parentTop + parentHeight) {
    scrollParent.scrollTop = top - parentHeight + height
  }
}

/**
 * /////////////////////////////////////////////////////////////////////
 * ***
 * /////////////////////////////////////////////////////////////////////
 */

export function focusInput(el) {
  el.focus();
  el.setSelectionRange(0, el.value.length);
}

/**
 * /////////////////////////////////////////////////////////////////////
 * *** thunk (Partial function)
 * /////////////////////////////////////////////////////////////////////
 */

export function thunkify(fnc) {
  const args = Array.prototype.slice.call(arguments, 1);
  return function(act) {
    fnc(act, Array.prototype.concat.apply(arguments, args));
  };
}

/**
 * /////////////////////////////////////////////////////////////////////
 * *** inherit a object
 * /////////////////////////////////////////////////////////////////////
 */

export function inherit(Child, Parent) {
  var Func = function() {};
  Func.prototype = Parent.prototype;
  Child.prototype = new Func();

  Child.prototype._super = Parent;
  Child.prototype.constructor = Child;
}

/**
 * /////////////////////////////////////////////////////////////////////
 * *** type checker
 * /////////////////////////////////////////////////////////////////////
 */

export function getType(target) {
  return Object.prototype.toString
    .call(target)
    .replace(/^\[object (.+)\]$/, "$1")
    .toLowerCase();
}

/**
 * /////////////////////////////////////////////////////////////////////
 * *** flat a nest array
 * /////////////////////////////////////////////////////////////////////
 */

export function flatten(items) {
  return items.reduce((acc, item) => {
    if (item instanceof Array) acc.push(...flatten(item));
    else if (item) acc.push(item);

    return acc;
  }, []);
}


export function getComponentName() {

}