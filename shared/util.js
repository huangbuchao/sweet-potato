/**
 * @flow
 */
import path from 'path';
import * as CircularJSON from 'vendor/transfer';

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
  return str && str.replace(kebabizeREG, (_, lowerCaseCharacter, upperCaseCharacter) => {
    return `${lowerCaseCharacter}-${upperCaseCharacter}`;
  }).toLowerCase();
});

function toUpper(_, c) {
  return c ? c.toUpperCase() : '';
}

export function getComponentDisplayName (originalName, style = 'class') {
  switch (style) {
    case 'class':
      return classify(originalName)
    case 'kebab':
      return kebabize(originalName)
    case 'original':
    default:
      return originalName
  }
}

export function inDoc (node) {
  if (!node) return false
  var doc = node.ownerDocument.documentElement
  var parent = node.parentNode
  return doc === node ||
    doc === parent ||
    !!(parent && parent.nodeType === 1 && (doc.contains(parent)))
}

/**
 * Stringify/parse data using CircularJSON.
 */

export const UNDEFINED = '__vue_devtool_undefined__'
export const INFINITY = '__vue_devtool_infinity__'
export const NEGATIVE_INFINITY = '__vue_devtool_negative_infinity__'
export const NAN = '__vue_devtool_nan__'

export const SPECIAL_TOKENS = {
  'true': true,
  'false': false,
  'undefined': UNDEFINED,
  'null': null,
  '-Infinity': NEGATIVE_INFINITY,
  'Infinity': INFINITY,
  'NaN': NAN
}

export const MAX_STRING_SIZE = 10000
export const MAX_ARRAY_SIZE = 5000

export function specialTokenToString (value) {
  if (value === null) {
    return 'null'
  } else if (value === UNDEFINED) {
    return 'undefined'
  } else if (value === NAN) {
    return 'NaN'
  } else if (value === INFINITY) {
    return 'Infinity'
  } else if (value === NEGATIVE_INFINITY) {
    return '-Infinity'
  }
  return false
}


const ESC = {
  '<': "&lt",
  '>': "&gt",
  '"': "&quot",
  '&': "&amp"
};

export function escape(s) {
  return s.replace(/[<>&"]/, escapeChar);
}

function escapeChar(match) {
  return ESC[match] || match;
}

export function copyToClipboard(state) {
  if(typeof document === 'undefined') return;
  const dummyTextArea = document.createElement('textArea');
  dummyTextArea.textContent;
}



export function get (object, path) {
  const sections = Array.isArray(path) ? path : path.split('.')
  for (let i = 0; i < sections.length; i++) {
    object = object[sections[i]]
    if (!object) {
      return undefined
    }
  }
  return object
}



//cust
export function thunkify(fnc) {
  const args = Array.prototype.slice.call(arguments, 1);
  return function(act) {
    fnc(act, Array.prototype.concat.apply(arguments, args));
  };
}

export function inherit(Child, Parent) {
  var Func = function() {};
  Func.prototype = Parent.prototype;
  Child.prototype = new Func();

  Child.prototype._super = Parent;
  Child.prototype.constructor = Child;
}

export function getType(target) {
  return Object.prototype.toString
    .call(target)
    .replace(/^\[object (.+)\]$/, "$1")
    .toLowerCase();
}
