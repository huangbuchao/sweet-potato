/**
 * https://github.com/huangbuchao/CocosHammer.JS
 */

(function(exportName, undefined) {
  "use strict";

  var TYPE_FUNCTION = "function";

  var round = Math.round;
  var abs = Math.abs;
  var now = Date.now;

  /**
   * set a timeout with a given scope
   * @param {Function} fn
   * @param {Number} timeout
   * @param {Object} context
   * @returns {number}
   */
  function setTimeoutContext(fn, timeout, context) {
    return setTimeout(bindFn(fn, context), timeout);
  }

  /**
   * if the argument is an array, we want to execute the fn on each entry
   * if it aint an array we don't want to do a thing.
   * this is used by all the methods that accept a single and array argument.
   * @param {*|Array} arg
   * @param {String} fn
   * @param {Object} [context]
   * @returns {Boolean}
   */
  function invokeArrayArg(arg, fn, context) {
    if (Array.isArray(arg)) {
      each(arg, context[fn], context);
      return true;
    }
    return false;
  }

  /**
   * walk objects and arrays
   * @param {Object} obj
   * @param {Function} iterator
   * @param {Object} context
   */
  function each(obj, iterator, context) {
    var i;

    if (!obj) {
      return;
    }

    if (obj.forEach) {
      obj.forEach(iterator, context);
    } else if (obj.length !== undefined) {
      i = 0;
      while (i < obj.length) {
        iterator.call(context, obj[i], i, obj);
        i++;
      }
    } else {
      for (i in obj) {
        obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj);
      }
    }
  }

  /**
   * wrap a method with a deprecation warning and stack trace
   * @param {Function} method
   * @param {String} name
   * @param {String} message
   * @returns {Function} A new function wrapping the supplied method.
   */
  function deprecate(method, name, message) {
    var deprecationMessage =
      "DEPRECATED METHOD: " + name + "\n" + message + " AT \n";
    return function() {
      var e = new Error("get-stack-trace");
      var stack =
        e && e.stack
          ? e.stack
              .replace(/^[^\(]+?[\n$]/gm, "")
              .replace(/^\s+at\s+/gm, "")
              .replace(/^Object.<anonymous>\s*\(/gm, "{anonymous}()@")
          : "Unknown Stack Trace";

      var log = window.console && (window.console.warn || window.console.log);
      if (log) {
        log.call(window.console, deprecationMessage, stack);
      }
      return method.apply(this, arguments);
    };
  }

  /**
   * extend object.
   * means that properties in dest will be overwritten by the ones in src.
   * @param {Object} target
   * @param {...Object} objects_to_assign
   * @returns {Object} target
   */
  var assign;
  if (typeof Object.assign !== "function") {
    assign = function assign(target) {
      if (target === undefined || target === null) {
        throw new TypeError("Cannot convert undefined or null to object");
      }

      var output = Object(target);
      for (var index = 1; index < arguments.length; index++) {
        var source = arguments[index];
        if (source !== undefined && source !== null) {
          for (var nextKey in source) {
            if (source.hasOwnProperty(nextKey)) {
              output[nextKey] = source[nextKey];
            }
          }
        }
      }
      return output;
    };
  } else {
    assign = Object.assign;
  }

  /**
   * extend object.
   * means that properties in dest will be overwritten by the ones in src.
   * @param {Object} dest
   * @param {Object} src
   * @param {Boolean} [merge=false]
   * @returns {Object} dest
   */
  var extend = deprecate(
    function extend(dest, src, merge) {
      var keys = Object.keys(src);
      var i = 0;
      while (i < keys.length) {
        if (!merge || (merge && dest[keys[i]] === undefined)) {
          dest[keys[i]] = src[keys[i]];
        }
        i++;
      }
      return dest;
    },
    "extend",
    "Use `assign`."
  );

  /**
   * merge the values from src in the dest.
   * means that properties that exist in dest will not be overwritten by src
   * @param {Object} dest
   * @param {Object} src
   * @returns {Object} dest
   */
  var merge = deprecate(
    function merge(dest, src) {
      return extend(dest, src, true);
    },
    "merge",
    "Use `assign`."
  );

  /**
   * simple class inheritance
   * @param {Function} child
   * @param {Function} base
   * @param {Object} [properties]
   */
  function inherit(child, base, properties) {
    var baseP = base.prototype,
      childP;

    childP = child.prototype = Object.create(baseP);
    childP.constructor = child;
    childP._super = baseP;

    if (properties) {
      assign(childP, properties);
    }
  }

  /**
   * simple function bind
   * @param {Function} fn
   * @param {Object} context
   * @returns {Function}
   */
  function bindFn(fn, context) {
    return function boundFn() {
      return fn.apply(context, arguments);
    };
  }

  /**
   * let a boolean value also be a function that must return a boolean
   * this first item in args will be used as the context
   * @param {Boolean|Function} val
   * @param {Array} [args]
   * @returns {Boolean}
   */
  function boolOrFn(val, args) {
    if (typeof val == TYPE_FUNCTION) {
      return val.apply(args ? args[0] || undefined : undefined, args);
    }
    return val;
  }

  /**
   * use the val2 when val1 is undefined
   * @param {*} val1
   * @param {*} val2
   * @returns {*}
   */
  function ifUndefined(val1, val2) {
    return val1 === undefined ? val2 : val1;
  }

  /**
   * addEventListener with multiple events at once
   * @param {cc.Node reference cc.EventTarget} target
   * @param {String} types
   * @param {Function} handler
   */
  function addEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
      target.on(type, handler);
    });
  }

  /**
   * removeEventListener with multiple events at once
   * @param {cc.Node reference cc.EventTarget} target
   * @param {cc.Node.EventType} types
   * @param {Function} handler
   */
  function removeEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
      target.off(type, handler);
    });
  }

  /**
   * find if a node is in the given parent
   * @method hasParent
   * @param {cc.Node} node
   * @param {cc.Node} parent
   * @return {Boolean} found
   */
  function hasParent(node, parent) {
    while (node) {
      if (node == parent) {
        return true;
      }
      node = node.parent;
    }
    return false;
  }

  /**
   * small indexOf wrapper
   * @param {String} str
   * @param {String} find
   * @returns {Boolean} found
   */
  function inStr(str, find) {
    return str.indexOf(find) > -1;
  }

  /**
   * split string on whitespace
   * @param {String} str
   * @returns {Array} words
   */
  function splitStr(str) {
    return str.trim().split(/\s+/g);
  }

  /**
   * find if a array contains the object using indexOf or a simple polyFill
   * @param {Array} src
   * @param {String} find
   * @param {String} [findByKey]
   * @return {Boolean|Number} false when not found, or the index
   */
  function inArray(src, find, findByKey) {
    if (src.indexOf && !findByKey) {
      return src.indexOf(find);
    } else {
      var i = 0;
      while (i < src.length) {
        if (
          (findByKey && src[i][findByKey] == find) ||
          (!findByKey && src[i] === find)
        ) {
          return i;
        }
        i++;
      }
      return -1;
    }
  }

  /**
   * convert array-like objects to real arrays
   * @param {Object} obj
   * @returns {Array}
   */
  function toArray(obj) {
    return Array.prototype.slice.call(obj, 0);
  }

  /**
   * unique array with objects based on a key (like 'id') or just by the array's value
   * @param {Array} src [{id:1},{id:2},{id:1}]
   * @param {String} [key]
   * @param {Boolean} [sort=False]
   * @returns {Array} [{id:1},{id:2}]
   */
  function uniqueArray(src, key, sort) {
    var results = [];
    var values = [];
    var i = 0;

    while (i < src.length) {
      var val = key ? src[i][key] : src[i];
      if (inArray(values, val) < 0) {
        results.push(src[i]);
      }
      values[i] = val;
      i++;
    }

    if (sort) {
      if (!key) {
        results = results.sort();
      } else {
        results = results.sort(function sortUniqueArray(a, b) {
          return a[key] > b[key];
        });
      }
    }

    return results;
  }

  /**
   * get a unique id
   * @returns {number} uniqueId
   */
  var _uniqueId = 1;
  function uniqueId() {
    return _uniqueId++;
  }

  var INPUT_TYPE_TOUCH = "touch";

  var COMPUTE_INTERVAL = 25;

  var INPUT_START = 1;
  var INPUT_MOVE = 2;
  var INPUT_END = 4;
  var INPUT_CANCEL = 8;

  var DIRECTION_NONE = 1;
  var DIRECTION_LEFT = 2;
  var DIRECTION_RIGHT = 4;
  var DIRECTION_UP = 8;
  var DIRECTION_DOWN = 16;

  var DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT;
  var DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN;
  var DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL;

  var PROPS_XY = ["x", "y"];

  /**
   * create new input type manager
   * @param {Manager} manager
   * @param {Function} callback
   * @returns {Input}
   * @constructor
   */
  function Input(manager, callback) {
    var self = this;
    this.manager = manager;
    this.callback = callback;
    this.element = manager.element;
    this.target = manager.options.inputTarget;

    // smaller wrapper around the handler, for the scope and the enabled state of the manager,
    // so when disabled the input events are completely bypassed.
    this.nodeHandler = function(ev) {
      if (boolOrFn(manager.options.enable, [manager])) {
        self.handler(ev);
      }
    };

    this.init();
  }

  Input.prototype = {
    /**
     * should handle the inputEvent data and trigger the callback
     * @virtual
     */
    handler: function() {},

    /**
     * bind the events
     */
    init: function() {
      this.evEl && addEventListeners(this.element, this.evEl, this.nodeHandler);
      this.evTarget &&
        addEventListeners(this.target, this.evTarget, this.nodeHandler);
    },

    /**
     * unbind the events
     */
    destroy: function() {
      this.evEl &&
        removeEventListeners(this.element, this.evEl, this.nodeHandler);
      this.evTarget &&
        removeEventListeners(this.target, this.evTarget, this.nodeHandler);
    }
  };

  /**
   * create new input type manager
   * called by the Manager constructor
   * @param {Hammer} manager
   * @returns {Input}
   */
  function createInputInstance(manager) {
    var Type;
    var inputClass = manager.options.inputClass;

    if (inputClass) {
      Type = inputClass;
    } else {
      Type = TouchInput;
    }
    return new Type(manager, inputHandler);
  }

  /**
   * handle input events
   * @param {Manager} manager
   * @param {String} eventType
   * @param {Object} input
   */
  function inputHandler(manager, eventType, input) {
    var pointersLen = input.pointers.length;
    var changedPointersLen = input.changedPointers.length;
    var isFirst =
      eventType & INPUT_START && pointersLen - changedPointersLen === 0;
    var isFinal =
      eventType & (INPUT_END | INPUT_CANCEL) &&
      pointersLen - changedPointersLen === 0;

    input.isFirst = !!isFirst;
    input.isFinal = !!isFinal;

    if (isFirst) {
      manager.session = {};
    }

    // source event is the normalized value of the domEvents
    // like 'touchstart, mouseup, pointerdown'
    input.eventType = eventType;

    // compute scale, rotation etc
    computeInputData(manager, input);

    // emit secret event
    manager.emit("hammer.input", input);

    manager.recognize(input);
    manager.session.prevInput = input;
  }

  /**
   * extend the data with some usable properties like scale, rotate, velocity etc
   * @param {Object} manager
   * @param {Object} input
   */
  function computeInputData(manager, input) {
    var session = manager.session;
    var pointers = input.pointers;
    var pointersLength = pointers.length;

    // store the first input to calculate the distance and direction
    if (!session.firstInput) {
      session.firstInput = simpleCloneInputData(input);
    }

    // to compute scale and rotation we need to store the multiple touches
    if (pointersLength === 1) {
      session.firstMultiple = false;
    }

    var firstInput = session.firstInput;
    var offsetCenter = firstInput.center;
    var center = (input.center = getCenter(pointers));
    input.timeStamp = now();
    input.deltaTime = input.timeStamp - firstInput.timeStamp;

    input.angle = getAngle(offsetCenter, center);
    input.distance = getDistance(offsetCenter, center);

    computeDeltaXY(session, input);
    input.offsetDirection = getDirection(input.deltaX, input.deltaY);

    var overallVelocity = getVelocity(
      input.deltaTime,
      input.deltaX,
      input.deltaY
    );
    input.overallVelocityX = overallVelocity.x;
    input.overallVelocityY = overallVelocity.y;
    input.overallVelocity =
      abs(overallVelocity.x) > abs(overallVelocity.y)
        ? overallVelocity.x
        : overallVelocity.y;

    input.scale = 1;
    input.rotation = getRotationByNodePoints(manager, input);

    input.maxPointers = !session.prevInput
      ? input.pointers.length
      : input.pointers.length > session.prevInput.maxPointers
      ? input.pointers.length
      : session.prevInput.maxPointers;

    computeIntervalInputData(session, input);

    // find the correct target
    var target = manager.element;
    if (hasParent(input.srcEvent.target, target)) {
      target = input.srcEvent.target;
    }

    input.target = target;
  }

  function computeDeltaXY(session, input) {
    var center = input.center;
    var offset = session.offsetDelta || {};
    var prevDelta = session.prevDelta || {};
    var prevInput = session.prevInput || {};

    if (input.eventType === INPUT_START || prevInput.eventType === INPUT_END) {
      prevDelta = session.prevDelta = {
        x: prevInput.deltaX || 0,
        y: prevInput.deltaY || 0
      };

      offset = session.offsetDelta = {
        x: center.x,
        y: center.y
      };
    }

    input.deltaX = prevDelta.x + (center.x - offset.x);
    input.deltaY = prevDelta.y + (center.y - offset.y);
  }

  /**
   * velocity is calculated every x ms
   * @param {Object} session
   * @param {Object} input
   */
  function computeIntervalInputData(session, input) {
    var last = session.lastInterval || input,
      deltaTime = input.timeStamp - last.timeStamp,
      velocity,
      velocityX,
      velocityY,
      direction;

    if (
      input.eventType != INPUT_CANCEL &&
      (deltaTime > COMPUTE_INTERVAL || last.velocity === undefined)
    ) {
      var deltaX = input.deltaX - last.deltaX;
      var deltaY = input.deltaY - last.deltaY;

      var v = getVelocity(deltaTime, deltaX, deltaY);
      velocityX = v.x;
      velocityY = v.y;
      velocity = abs(v.x) > abs(v.y) ? v.x : v.y;
      direction = getDirection(deltaX, deltaY);

      session.lastInterval = input;
    } else {
      // use latest velocity info if it doesn't overtake a minimum period
      velocity = last.velocity;
      velocityX = last.velocityX;
      velocityY = last.velocityY;
      direction = last.direction;
    }

    input.velocity = velocity;
    input.velocityX = velocityX;
    input.velocityY = velocityY;
    input.direction = direction;
  }

  /**
   * create a simple clone from the input used for storage of firstInput
   * @param {Object} input
   * @returns {Object} clonedInputData
   */
  function simpleCloneInputData(input) {
    // make a simple copy of the pointers because we will get a reference if we don't
    // we only need XY for the calculations
    var pointers = [];
    var i = 0;
    while (i < input.pointers.length) {
      pointers[i] = {
        x: round(input.pointers[i].x),
        y: round(input.pointers[i].y)
      };
      i++;
    }

    return {
      timeStamp: now(),
      pointers: pointers,
      center: getCenter(pointers),
      deltaX: input.deltaX,
      deltaY: input.deltaY
    };
  }

  /**
   * get the center of all the pointers
   * @param {Array} pointers
   * @return {Object} center contains `x` and `y` properties
   */
  function getCenter(pointers) {
    var pointersLength = pointers.length;
    // no need to loop when only one touch
    if (pointersLength === 1) {
      return {
        x: round(pointers[0].x),
        y: round(pointers[0].y)
      };
    }

    var x = 0,
      y = 0,
      i = 0;
    while (i < pointersLength) {
      x += pointers[i].x;
      y += pointers[i].y;
      i++;
    }

    return {
      x: round(x / pointersLength),
      y: round(y / pointersLength)
    };
  }

  /**
   * calculate the velocity between two points. unit is in px per ms.
   * @param {Number} deltaTime
   * @param {Number} x
   * @param {Number} y
   * @return {Object} velocity `x` and `y`
   */
  function getVelocity(deltaTime, x, y) {
    return {
      x: x / deltaTime || 0,
      y: y / deltaTime || 0
    };
  }

  /**
   * get the direction between two points
   * @param {Number} x
   * @param {Number} y
   * @return {Number} direction
   */
  function getDirection(x, y) {
    if (x === y) {
      return DIRECTION_NONE;
    }

    if (abs(x) >= abs(y)) {
      return x < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
    }
    return y > 0 ? DIRECTION_UP : DIRECTION_DOWN;
  }

  /**
   * calculate the absolute distance between two points
   * @param {Object} p1 {x, y}
   * @param {Object} p2 {x, y}
   * @param {Array} [props] containing x and y keys
   * @return {Number} distance
   */
  function getDistance(p1, p2, props) {
    if (!props) {
      props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
      y = p2[props[1]] - p1[props[1]];

    return Math.sqrt(x * x + y * y);
  }

  /**
   * calculate the angle between two coordinates
   * @param {Object} p1
   * @param {Object} p2
   * @param {Array} [props] containing x and y keys
   * @return {Number} angle
   */
  function getAngle(p1, p2, props) {
    if (!props) {
      props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
      y = p2[props[1]] - p1[props[1]];
    return (Math.atan2(y, x) * 180) / Math.PI;
  }

  /**
   * calculate the rotation degrees when rotate a CC.Node instance
   * @param {cc.p} originPoint node orgin point
   * @param {cc.p} startPoint touch start point
   * @param {cc.p} endPoint touch cancel point
   * @return {Object} include nextAngle and startAngle
   */
  function getRotationByNodePoints(manager, input) {
    var originPoint = manager.elemenOriginPoint;
    var startPoint = manager.element.convertToNodeSpaceAR(
      input.srcEvent.getStartLocation()
    );
    var endPoint = manager.element.convertToNodeSpaceAR(input.center);
    const nextAngle = convertAngle(getAngle(endPoint, originPoint));
    const startAngle = convertAngle(getAngle(startPoint, originPoint));
    var diffAngle = nextAngle - startAngle;
    var rotation = round(diffAngle <= 0 ? 360 + diffAngle : diffAngle);
    return rotation;
  }

  /**
   * convert angle to positive integer, range 0 to 360 degrees
   * @param {*} angle
   */
  function convertAngle(angle) {
    if (angle <= 90) {
      return 90 - angle;
    }
    return 450 - angle;
  }

  var TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
  };

  var TOUCH_TARGET_EVENTS = "touchstart touchmove touchend touchcancel";

  /**
   * Multi-user touch events input
   * @constructor
   * @extends Input
   */
  function TouchInput() {
    this.evTarget = TOUCH_TARGET_EVENTS;

    Input.apply(this, arguments);
  }

  inherit(TouchInput, Input, {
    handler: function MTEhandler(ev) {
      var type = TOUCH_INPUT_MAP[ev.type];
      var touchs = [ev.getLocation()];
      this.callback(this.manager, type, {
        pointers: touchs,
        changedPointers: touchs,
        pointerType: INPUT_TYPE_TOUCH,
        srcEvent: ev
      });
    }
  });

  /**
   * Recognizer flow explained; *
   * All recognizers have the initial state of POSSIBLE when a input session starts.
   * The definition of a input session is from the first input until the last input, with all it's movement in it. *
   * Example session for mouse-input: mousedown -> mousemove -> mouseup
   *
   * On each recognizing cycle (see Manager.recognize) the .recognize() method is executed
   * which determines with state it should be.
   *
   * If the recognizer has the state FAILED, CANCELLED or RECOGNIZED (equals ENDED), it is reset to
   * POSSIBLE to give it another change on the next cycle.
   *
   *               Possible
   *                  |
   *            +-----+---------------+
   *            |                     |
   *      +-----+-----+               |
   *      |           |               |
   *   Failed      Cancelled          |
   *                          +-------+------+
   *                          |              |
   *                      Recognized       Began
   *                                         |
   *                                      Changed
   *                                         |
   *                                  Ended/Recognized
   */
  var STATE_POSSIBLE = 1;
  var STATE_BEGAN = 2;
  var STATE_CHANGED = 4;
  var STATE_ENDED = 8;
  var STATE_RECOGNIZED = STATE_ENDED;
  var STATE_CANCELLED = 16;
  var STATE_FAILED = 32;

  /**
   * Recognizer
   * Every recognizer needs to extend from this class.
   * @constructor
   * @param {Object} options
   */
  function Recognizer(options) {
    this.options = assign({}, this.defaults, options || {});

    this.id = uniqueId();

    this.manager = null;

    // default is enable true
    this.options.enable = ifUndefined(this.options.enable, true);

    this.state = STATE_POSSIBLE;

    this.simultaneous = {};
    this.requireFail = [];
  }

  Recognizer.prototype = {
    /**
     * @virtual
     * @type {Object}
     */
    defaults: {},

    /**
     * set options
     * @param {Object} options
     * @return {Recognizer}
     */
    set: function(options) {
      assign(this.options, options);
      return this;
    },

    /**
     * recognize simultaneous with an other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    recognizeWith: function(otherRecognizer) {
      if (invokeArrayArg(otherRecognizer, "recognizeWith", this)) {
        return this;
      }

      var simultaneous = this.simultaneous;
      otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
      if (!simultaneous[otherRecognizer.id]) {
        simultaneous[otherRecognizer.id] = otherRecognizer;
        otherRecognizer.recognizeWith(this);
      }
      return this;
    },

    /**
     * drop the simultaneous link. it doesnt remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRecognizeWith: function(otherRecognizer) {
      if (invokeArrayArg(otherRecognizer, "dropRecognizeWith", this)) {
        return this;
      }

      otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
      delete this.simultaneous[otherRecognizer.id];
      return this;
    },

    /**
     * recognizer can only run when an other is failing
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    requireFailure: function(otherRecognizer) {
      if (invokeArrayArg(otherRecognizer, "requireFailure", this)) {
        return this;
      }

      var requireFail = this.requireFail;
      otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
      if (inArray(requireFail, otherRecognizer) === -1) {
        requireFail.push(otherRecognizer);
        otherRecognizer.requireFailure(this);
      }
      return this;
    },

    /**
     * drop the requireFailure link. it does not remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRequireFailure: function(otherRecognizer) {
      if (invokeArrayArg(otherRecognizer, "dropRequireFailure", this)) {
        return this;
      }

      otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
      var index = inArray(this.requireFail, otherRecognizer);
      if (index > -1) {
        this.requireFail.splice(index, 1);
      }
      return this;
    },

    /**
     * has require failures boolean
     * @returns {boolean}
     */
    hasRequireFailures: function() {
      return this.requireFail.length > 0;
    },

    /**
     * if the recognizer can recognize simultaneous with an other recognizer
     * @param {Recognizer} otherRecognizer
     * @returns {Boolean}
     */
    canRecognizeWith: function(otherRecognizer) {
      return !!this.simultaneous[otherRecognizer.id];
    },

    /**
     * You should use `tryEmit` instead of `emit` directly to check
     * that all the needed recognizers has failed before emitting.
     * @param {Object} input
     */
    emit: function(input) {
      var self = this;
      var state = this.state;

      function emit(event) {
        self.manager.emit(event, input);
      }

      // 'panstart' and 'panmove'
      if (state < STATE_ENDED) {
        emit(self.options.event + stateStr(state));
      }

      emit(self.options.event); // simple 'eventName' events

      if (input.additionalEvent) {
        // additional event(panleft, panright, pinchin, pinchout...)
        emit(input.additionalEvent);
      }

      // panend and pancancel
      if (state >= STATE_ENDED) {
        emit(self.options.event + stateStr(state));
      }
    },

    /**
     * Check that all the require failure recognizers has failed,
     * if true, it emits a gesture event,
     * otherwise, setup the state to FAILED.
     * @param {Object} input
     */
    tryEmit: function(input) {
      if (this.canEmit()) {
        return this.emit(input);
      }
      // it's failing anyway
      this.state = STATE_FAILED;
    },

    /**
     * can we emit?
     * @returns {boolean}
     */
    canEmit: function() {
      var i = 0;
      while (i < this.requireFail.length) {
        if (!(this.requireFail[i].state & (STATE_FAILED | STATE_POSSIBLE))) {
          return false;
        }
        i++;
      }
      return true;
    },

    /**
     * update the recognizer
     * @param {Object} inputData
     */
    recognize: function(inputData) {
      // make a new copy of the inputData
      // so we can change the inputData without messing up the other recognizers
      var inputDataClone = assign({}, inputData);

      // is is enabled and allow recognizing?
      if (!boolOrFn(this.options.enable, [this, inputDataClone])) {
        this.reset();
        this.state = STATE_FAILED;
        return;
      }

      // reset when we've reached the end
      if (this.state & (STATE_RECOGNIZED | STATE_CANCELLED | STATE_FAILED)) {
        this.state = STATE_POSSIBLE;
      }

      this.state = this.process(inputDataClone);

      // the recognizer has recognized a gesture
      // so trigger an event
      if (
        this.state &
        (STATE_BEGAN | STATE_CHANGED | STATE_ENDED | STATE_CANCELLED)
      ) {
        this.tryEmit(inputDataClone);
      }
    },

    /**
     * return the state of the recognizer
     * the actual recognizing happens in this method
     * @virtual
     * @param {Object} inputData
     * @returns {Const} STATE
     */
    process: function(inputData) {}, // jshint ignore:line

    /**
     * called when the gesture isn't allowed to recognize
     * like when another is being recognized or it is disabled
     * @virtual
     */
    reset: function() {}
  };

  /**
   * get a usable string, used as event postfix
   * @param {Const} state
   * @returns {String} state
   */
  function stateStr(state) {
    if (state & STATE_CANCELLED) {
      return "cancel";
    } else if (state & STATE_ENDED) {
      return "end";
    } else if (state & STATE_CHANGED) {
      return "move";
    } else if (state & STATE_BEGAN) {
      return "start";
    }
    return "";
  }

  /**
   * direction cons to string
   * @param {Const} direction
   * @returns {String}
   */
  function directionStr(direction) {
    if (direction == DIRECTION_DOWN) {
      return "down";
    } else if (direction == DIRECTION_UP) {
      return "up";
    } else if (direction == DIRECTION_LEFT) {
      return "left";
    } else if (direction == DIRECTION_RIGHT) {
      return "right";
    }
    return "";
  }

  /**
   * get a recognizer by name if it is bound to a manager
   * @param {Recognizer|String} otherRecognizer
   * @param {Recognizer} recognizer
   * @returns {Recognizer}
   */
  function getRecognizerByNameIfManager(otherRecognizer, recognizer) {
    var manager = recognizer.manager;
    if (manager) {
      return manager.get(otherRecognizer);
    }
    return otherRecognizer;
  }

  /**
   * This recognizer is just used as a base for the simple attribute recognizers.
   * @constructor
   * @extends Recognizer
   */
  function AttrRecognizer() {
    Recognizer.apply(this, arguments);
  }

  inherit(AttrRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof AttrRecognizer
     */
    defaults: {
      /**
       * @type {Number}
       * @default 1
       */
      pointers: 1
    },

    /**
     * Used to check if it the recognizer receives valid input, like input.distance > 10.
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {Boolean} recognized
     */
    attrTest: function(input) {
      var optionPointers = this.options.pointers;
      return optionPointers === 0 || input.pointers.length === optionPointers;
    },

    /**
     * Process the input and return the state for the recognizer
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {*} State
     */
    process: function(input) {
      var state = this.state;
      var eventType = input.eventType;

      var isRecognized = state & (STATE_BEGAN | STATE_CHANGED);
      var isValid = this.attrTest(input);

      // on cancel input and we've recognized before, return STATE_CANCELLED
      if (isRecognized && (eventType & INPUT_CANCEL || !isValid)) {
        return state | STATE_CANCELLED;
      } else if (isRecognized || isValid) {
        if (eventType & INPUT_END) {
          return state | STATE_ENDED;
        } else if (!(state & STATE_BEGAN)) {
          return STATE_BEGAN;
        }
        return state | STATE_CHANGED;
      }
      return STATE_FAILED;
    }
  });

  /**
   * Pan
   * Recognized when the pointer is down and moved in the allowed direction.
   * @constructor
   * @extends AttrRecognizer
   */
  function PanRecognizer() {
    AttrRecognizer.apply(this, arguments);

    this.pX = null;
    this.pY = null;
  }

  inherit(PanRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PanRecognizer
     */
    defaults: {
      event: "pan",
      threshold: 10,
      pointers: 1,
      direction: DIRECTION_ALL
    },

    directionTest: function(input) {
      var options = this.options;
      var hasMoved = true;
      var distance = input.distance;
      var direction = input.direction;
      var x = input.deltaX;
      var y = input.deltaY;

      // lock to axis?
      if (!(direction & options.direction)) {
        if (options.direction & DIRECTION_HORIZONTAL) {
          direction =
            x === 0 ? DIRECTION_NONE : x < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
          hasMoved = x != this.pX;
          distance = Math.abs(input.deltaX);
        } else {
          direction =
            y === 0 ? DIRECTION_NONE : y < 0 ? DIRECTION_UP : DIRECTION_DOWN;
          hasMoved = y != this.pY;
          distance = Math.abs(input.deltaY);
        }
      }
      input.direction = direction;
      return (
        hasMoved &&
        distance > options.threshold &&
        direction & options.direction
      );
    },

    attrTest: function(input) {
      return (
        AttrRecognizer.prototype.attrTest.call(this, input) &&
        (this.state & STATE_BEGAN ||
          (!(this.state & STATE_BEGAN) && this.directionTest(input)))
      );
    },

    emit: function(input) {
      this.pX = input.deltaX;
      this.pY = input.deltaY;
      var direction = directionStr(input.direction);

      if (direction) {
        input.additionalEvent = this.options.event + direction;
      }
      this._super.emit.call(this, input);
    }
  });

  /**
   * Press
   * Recognized when the pointer is down for x ms without any movement.
   * @constructor
   * @extends Recognizer
   */
  function PressRecognizer() {
    Recognizer.apply(this, arguments);

    this._timer = null;
    this._input = null;
  }

  inherit(PressRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PressRecognizer
     */
    defaults: {
      event: "press",
      pointers: 1,
      time: 251, // minimal time of the pointer to be pressed
      threshold: 9 // a minimal movement is ok, but keep it low
    },

    process: function(input) {
      var options = this.options;
      var validPointers = input.pointers.length === options.pointers;
      var validMovement = input.distance < options.threshold;
      var validTime = input.deltaTime > options.time;

      this._input = input;

      // we only allow little movement
      // and we've reached an end event, so a tap is possible
      if (
        !validMovement ||
        !validPointers ||
        (input.eventType & (INPUT_END | INPUT_CANCEL) && !validTime)
      ) {
        this.reset();
      } else if (input.eventType & INPUT_START) {
        this.reset();
        this._timer = setTimeoutContext(
          function() {
            this.state = STATE_RECOGNIZED;
            this.tryEmit();
          },
          options.time,
          this
        );
      } else if (input.eventType & INPUT_END) {
        return STATE_RECOGNIZED;
      }
      return STATE_FAILED;
    },

    reset: function() {
      clearTimeout(this._timer);
    },

    emit: function(input) {
      if (this.state !== STATE_RECOGNIZED) {
        return;
      }

      if (input && input.eventType & INPUT_END) {
        this.manager.emit(this.options.event + "up", input);
      } else {
        this._input.timeStamp = now();
        this.manager.emit(this.options.event, this._input);
      }
    }
  });

  /**
   * Rotate
   * Recognized when two or more pointer are moving in a circular motion.
   * @constructor
   * @extends AttrRecognizer
   */
  function RotateRecognizer() {
    AttrRecognizer.apply(this, arguments);
  }

  inherit(RotateRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof RotateRecognizer
     */
    defaults: {
      event: "rotate",
      threshold: 0,
      pointers: 1
    },

    attrTest: function(input) {
      return (
        this._super.attrTest.call(this, input) &&
        (Math.abs(input.rotation) > this.options.threshold ||
          this.state & STATE_BEGAN)
      );
    }
  });

  /**
   * Swipe
   * Recognized when the pointer is moving fast (velocity), with enough distance in the allowed direction.
   * @constructor
   * @extends AttrRecognizer
   */
  function SwipeRecognizer() {
    AttrRecognizer.apply(this, arguments);
  }

  inherit(SwipeRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof SwipeRecognizer
     */
    defaults: {
      event: "swipe",
      threshold: 10,
      velocity: 0.3,
      direction: DIRECTION_HORIZONTAL | DIRECTION_VERTICAL,
      pointers: 1
    },

    attrTest: function(input) {
      var direction = this.options.direction;
      var velocity;

      if (direction & (DIRECTION_HORIZONTAL | DIRECTION_VERTICAL)) {
        velocity = input.overallVelocity;
      } else if (direction & DIRECTION_HORIZONTAL) {
        velocity = input.overallVelocityX;
      } else if (direction & DIRECTION_VERTICAL) {
        velocity = input.overallVelocityY;
      }

      return (
        this._super.attrTest.call(this, input) &&
        direction & input.offsetDirection &&
        input.distance > this.options.threshold &&
        input.maxPointers == this.options.pointers &&
        abs(velocity) > this.options.velocity &&
        (input.eventType & INPUT_END || input.eventType & INPUT_CANCEL)
      );
    },

    emit: function(input) {
      var direction = directionStr(input.offsetDirection);
      if (direction) {
        this.manager.emit(this.options.event + direction, input);
      }

      this.manager.emit(this.options.event, input);
    }
  });

  /**
   * A tap is recognized when the pointer is doing a small tap/click. Multiple taps are recognized if they occur
   * between the given interval and position. The delay option can be used to recognize multi-taps without firing
   * a single tap.
   *
   * The eventData from the emitted event contains the property `tapCount`, which contains the amount of
   * multi-taps being recognized.
   * @constructor
   * @extends Recognizer
   */
  function TapRecognizer() {
    Recognizer.apply(this, arguments);

    // previous time and center,
    // used for tap counting
    this.pTime = false;
    this.pCenter = false;

    this._timer = null;
    this._input = null;
    this.count = 0;
  }

  inherit(TapRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof TapRecognizer
     */
    defaults: {
      event: "tap",
      pointers: 1,
      taps: 1,
      interval: 300, // max time between the multi-tap taps
      time: 250, // max time of the pointer to be down (like finger on the screen)
      threshold: 9, // a minimal movement is ok, but keep it low
      posThreshold: 10 // a multi-tap can be a bit off the initial position
    },

    process: function(input) {
      var options = this.options;

      var validPointers = input.pointers.length === options.pointers;
      var validMovement = input.distance < options.threshold;
      var validTouchTime = input.deltaTime < options.time;

      this.reset();

      if (input.eventType & INPUT_START && this.count === 0) {
        return this.failTimeout();
      }

      // we only allow little movement
      // and we've reached an end event, so a tap is possible
      if (validMovement && validTouchTime && validPointers) {
        if (input.eventType != INPUT_END) {
          return this.failTimeout();
        }

        var validInterval = this.pTime
          ? input.timeStamp - this.pTime < options.interval
          : true;
        var validMultiTap =
          !this.pCenter ||
          getDistance(this.pCenter, input.center) < options.posThreshold;

        this.pTime = input.timeStamp;
        this.pCenter = input.center;

        if (!validMultiTap || !validInterval) {
          this.count = 1;
        } else {
          this.count += 1;
        }

        this._input = input;

        // if tap count matches we have recognized it,
        // else it has began recognizing...
        var tapCount = this.count % options.taps;
        if (tapCount === 0) {
          // no failing requirements, immediately trigger the tap event
          // or wait as long as the multitap interval to trigger
          if (!this.hasRequireFailures()) {
            return STATE_RECOGNIZED;
          } else {
            this._timer = setTimeoutContext(
              function() {
                this.state = STATE_RECOGNIZED;
                this.tryEmit();
              },
              options.interval,
              this
            );
            return STATE_BEGAN;
          }
        }
      }
      return STATE_FAILED;
    },

    failTimeout: function() {
      this._timer = setTimeoutContext(
        function() {
          this.state = STATE_FAILED;
        },
        this.options.interval,
        this
      );
      return STATE_FAILED;
    },

    reset: function() {
      clearTimeout(this._timer);
    },

    emit: function() {
      if (this.state == STATE_RECOGNIZED) {
        this._input.tapCount = this.count;
        this.manager.emit(this.options.event, this._input);
      }
    }
  });

  /**
   * Simple way to create a manager with a default set of recognizers.
   * @param {cc.Node} element
   * @param {Object} [options]
   * @constructor
   */
  function Hammer(element, options) {
    options = options || {};
    options.recognizers = ifUndefined(
      options.recognizers,
      Hammer.defaults.preset
    );
    return new Manager(element, options);
  }

  /**
   * @const {string}
   */
  Hammer.VERSION = "2.0.8";

  /**
   * default settings
   * @namespace
   */
  Hammer.defaults = {
    /**
     * @type {Boolean}
     * @default true
     */
    enable: true,

    /**
     * EXPERIMENTAL FEATURE -- can be removed/changed
     * Change the parent input target element.
     * If Null, then it is being set the to main element.
     * @type {Null|EventTarget}
     * @default null
     */
    inputTarget: null,

    /**
     * force an input class
     * @type {Null|Function}
     * @default null
     */
    inputClass: TouchInput,

    /**
     * Default recognizer setup when calling `Hammer()`
     * When creating a new Manager these will be skipped.
     * @type {Array}
     */
    preset: [
      // RecognizerClass, options, [recognizeWith, ...], [requireFailure, ...]
      [RotateRecognizer, { enable: true }],
      [SwipeRecognizer, { direction: DIRECTION_ALL }, ["rotate"]],
      [PanRecognizer, { direction: DIRECTION_ALL }, ["rotate"]],
      [TapRecognizer, {}, ["rotate"]],
      [TapRecognizer, { event: "doubletap", taps: 2 }, ["rotate"]],
      [TapRecognizer, { event: "quadrupletap", taps: 4 }, ["rotate"]],
      [PressRecognizer, {}, ["rotate"]]
    ]
  };

  var STOP = 1;
  var FORCED_STOP = 2;

  /**
   * Manager
   * @param {cc.Node} element
   * @param {Object} [options]
   * @constructor
   */
  function Manager(element, options) {
    this.options = assign({}, Hammer.defaults, options || {});

    this.options.inputTarget = this.options.inputTarget || element;

    this.handlers = {};
    this.session = {};
    this.recognizers = [];

    this.element = element;
    this.elemenOriginPoint = element.getPosition(); //require fix
    this.input = createInputInstance(this);

    each(
      this.options.recognizers,
      function(item) {
        var recognizer = this.add(new item[0](item[1]));
        item[2] && recognizer.recognizeWith(item[2]);
        item[3] && recognizer.requireFailure(item[3]);
      },
      this
    );
  }

  Manager.prototype = {
    /**
     * set options
     * @param {Object} options
     * @returns {Manager}
     */
    set: function(options) {
      assign(this.options, options);

      if (options.inputTarget) {
        // Clean up existing event listeners and reinitialize
        this.input.destroy();
        this.input.target = options.inputTarget;
        this.input.init();
      }
      return this;
    },

    /**
     * stop recognizing for this session.
     * This session will be discarded, when a new [input]start event is fired.
     * When forced, the recognizer cycle is stopped immediately.
     * @param {Boolean} [force]
     */
    stop: function(force) {
      this.session.stopped = force ? FORCED_STOP : STOP;
    },

    /**
     * run the recognizers!
     * called by the inputHandler function on every movement of the pointers (touches)
     * it walks through all the recognizers and tries to detect the gesture that is being made
     * @param {Object} inputData
     */
    recognize: function(inputData) {
      var session = this.session;
      if (session.stopped) {
        return;
      }

      var recognizer;
      var recognizers = this.recognizers;

      // this holds the recognizer that is being recognized.
      // so the recognizer's state needs to be BEGAN, CHANGED, ENDED or RECOGNIZED
      // if no recognizer is detecting a thing, it is set to `null`
      var curRecognizer = session.curRecognizer;

      // reset when the last recognizer is recognized
      // or when we're in a new session
      if (
        !curRecognizer ||
        (curRecognizer && curRecognizer.state & STATE_RECOGNIZED)
      ) {
        curRecognizer = session.curRecognizer = null;
      }

      var i = 0;
      while (i < recognizers.length) {
        recognizer = recognizers[i];

        // find out if we are allowed try to recognize the input for this one.
        // 1.   allow if the session is NOT forced stopped (see the .stop() method)
        // 2.   allow if we still haven't recognized a gesture in this session, or the this recognizer is the one
        //      that is being recognized.
        // 3.   allow if the recognizer is allowed to run simultaneous with the current recognized recognizer.
        //      this can be setup with the `recognizeWith()` method on the recognizer.
        if (
          session.stopped !== FORCED_STOP && // 1
          (!curRecognizer ||
          recognizer == curRecognizer || // 2
            recognizer.canRecognizeWith(curRecognizer))
        ) {
          // 3
          recognizer.recognize(inputData);
        } else {
          recognizer.reset();
        }

        // if the recognizer has been recognizing the input as a valid gesture, we want to store this one as the
        // current active recognizer. but only if we don't already have an active recognizer
        if (
          !curRecognizer &&
          recognizer.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED)
        ) {
          curRecognizer = session.curRecognizer = recognizer;
        }
        i++;
      }
    },

    /**
     * get a recognizer by its event name.
     * @param {Recognizer|String} recognizer
     * @returns {Recognizer|Null}
     */
    get: function(recognizer) {
      if (recognizer instanceof Recognizer) {
        return recognizer;
      }

      var recognizers = this.recognizers;
      for (var i = 0; i < recognizers.length; i++) {
        if (recognizers[i].options.event == recognizer) {
          return recognizers[i];
        }
      }
      return null;
    },

    /**
     * add a recognizer to the manager
     * existing recognizers with the same event name will be removed
     * @param {Recognizer} recognizer
     * @returns {Recognizer|Manager}
     */
    add: function(recognizer) {
      if (invokeArrayArg(recognizer, "add", this)) {
        return this;
      }

      // remove existing
      var existing = this.get(recognizer.options.event);
      if (existing) {
        this.remove(existing);
      }

      this.recognizers.push(recognizer);
      recognizer.manager = this;

      return recognizer;
    },

    /**
     * remove a recognizer by name or instance
     * @param {Recognizer|String} recognizer
     * @returns {Manager}
     */
    remove: function(recognizer) {
      if (invokeArrayArg(recognizer, "remove", this)) {
        return this;
      }

      recognizer = this.get(recognizer);

      // let's make sure this recognizer exists
      if (recognizer) {
        var recognizers = this.recognizers;
        var index = inArray(recognizers, recognizer);

        if (index !== -1) {
          recognizers.splice(index, 1);
        }
      }

      return this;
    },

    /**
     * bind event
     * @param {String} events
     * @param {Function} handler
     * @param {Object || Lexical Scope} context
     * @returns {EventEmitter} this
     */
    on: function(events, handler, context, ...args) {
      if (events === undefined) {
        return;
      }
      if (handler === undefined) {
        return;
      }

      var handlers = this.handlers;
      var handlerBound = handler.bind(context, ...args);
      each(splitStr(events), function(event) {
        handlers[event] = handlers[event] || [];
        handlers[event].push(handlerBound);
      });
      return handlerBound;
    },

    /**
     * unbind event, leave emit blank to remove all handlers
     * @param {String} events
     * @param {Function} [handler]
     * @returns {EventEmitter} this
     */
    off: function(events, handlerBound) {
      if (events === undefined) {
        return;
      }

      var handlers = this.handlers;
      each(splitStr(events), function(event) {
        if (!handlerBound) {
          delete handlers[event];
        } else {
          handlers[event] &&
            handlers[event].splice(inArray(handlers[event], handlerBound), 1);
        }
      });
      return this;
    },

    /**
     * emit event to the listeners
     * @param {String} event
     * @param {Object} data
     */
    emit: function(event, data) {
      // no handlers, so skip it all
      //   console.log("eventType: ", event);
      //   console.log("handlers: ", this.handlers);
      var handlers = this.handlers[event] && this.handlers[event].slice();
      if (!handlers || !handlers.length) {
        return;
      }

      data.type = event;

      var i = 0;
      while (i < handlers.length) {
        handlers[i](data);
        i++;
      }
    },

    /**
     * destroy the manager and unbinds all events
     * it doesn't unbind dom events, that is the user own responsibility
     */
    destroy: function() {
      this.handlers = {};
      this.session = {};
      this.input.destroy();
      this.element = null;
    }
  };

  assign(Hammer, {
    INPUT_START: INPUT_START,
    INPUT_MOVE: INPUT_MOVE,
    INPUT_END: INPUT_END,
    INPUT_CANCEL: INPUT_CANCEL,

    STATE_POSSIBLE: STATE_POSSIBLE,
    STATE_BEGAN: STATE_BEGAN,
    STATE_CHANGED: STATE_CHANGED,
    STATE_ENDED: STATE_ENDED,
    STATE_RECOGNIZED: STATE_RECOGNIZED,
    STATE_CANCELLED: STATE_CANCELLED,
    STATE_FAILED: STATE_FAILED,

    DIRECTION_NONE: DIRECTION_NONE,
    DIRECTION_LEFT: DIRECTION_LEFT,
    DIRECTION_RIGHT: DIRECTION_RIGHT,
    DIRECTION_UP: DIRECTION_UP,
    DIRECTION_DOWN: DIRECTION_DOWN,
    DIRECTION_HORIZONTAL: DIRECTION_HORIZONTAL,
    DIRECTION_VERTICAL: DIRECTION_VERTICAL,
    DIRECTION_ALL: DIRECTION_ALL,

    Manager: Manager,
    Input: Input,

    TouchInput: TouchInput,

    Recognizer: Recognizer,
    AttrRecognizer: AttrRecognizer,
    Tap: TapRecognizer,
    Pan: PanRecognizer,
    Swipe: SwipeRecognizer,
    Rotate: RotateRecognizer,
    Press: PressRecognizer,

    on: addEventListeners,
    off: removeEventListeners,
    each: each,
    merge: merge,
    extend: extend,
    assign: assign,
    inherit: inherit,
    bindFn: bindFn
  });

  // this prevents errors when Hammer is loaded in the presence of an AMD
  //  style loader but by script tag, not by the loader.
  var freeGlobal =
    typeof window !== "undefined"
      ? window
      : typeof self !== "undefined"
      ? self
      : {}; // jshint ignore:line
  freeGlobal.Hammer = Hammer;

  if (typeof define === "function" && define.amd) {
    define(function() {
      return Hammer;
    });
  } else if (typeof module != "undefined" && module.exports) {
    module.exports = Hammer;
  }
})("Hammer");
