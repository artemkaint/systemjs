"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.REGISTRY = exports.systemJSPrototype = void 0;

var _common = require("./common.js");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var hasSymbol = typeof Symbol !== 'undefined';
var toStringTag = hasSymbol && Symbol.toStringTag;
var REGISTRY = hasSymbol ? Symbol() : '@';
exports.REGISTRY = REGISTRY;

function SystemJS() {
  this[REGISTRY] = {};
}

var systemJSPrototype = SystemJS.prototype;
exports.systemJSPrototype = systemJSPrototype;

systemJSPrototype.import = function (id, parentUrl) {
  var loader = this;
  return Promise.resolve(loader.resolve(id, parentUrl)).then(function (id) {
    var load = getOrCreateLoad(loader, id);
    return load.C || topLevelLoad(loader, load);
  });
}; // Hookable createContext function -> allowing eg custom import meta


systemJSPrototype.createContext = function (parentId) {
  return {
    url: parentId
  };
}; // onLoad(id, err) provided for tracing / hot-reloading


if (TRACING) systemJSPrototype.onload = function () {};
var lastRegister;

systemJSPrototype.register = function (deps, declare) {
  lastRegister = [deps, declare];
};
/*
 * getRegister provides the last anonymous System.register call
 */


systemJSPrototype.getRegister = function () {
  var _lastRegister = lastRegister;
  lastRegister = undefined;
  return _lastRegister;
};

function getOrCreateLoad(loader, id, firstParentUrl) {
  var load = loader[REGISTRY][id];
  if (load) return load;
  var importerSetters = [];
  var ns = Object.create(null);
  if (toStringTag) Object.defineProperty(ns, toStringTag, {
    value: 'Module'
  });
  var instantiatePromise = Promise.resolve().then(function () {
    return loader.instantiate(id, firstParentUrl);
  }).then(function (registration) {
    if (!registration) throw new Error('Module ' + id + ' did not instantiate');

    function _export(name, value) {
      // note if we have hoisted exports (including reexports)
      load.h = true;
      var changed = false;

      if (_typeof(name) !== 'object') {
        if (!(name in ns) || ns[name] !== value) {
          ns[name] = value;
          changed = true;
        }
      } else {
        for (var p in name) {
          var _value = name[p];

          if (!(p in ns) || ns[p] !== _value) {
            ns[p] = _value;
            changed = true;
          }
        }
      }

      if (changed) for (var i = 0; i < importerSetters.length; i++) {
        importerSetters[i](ns);
      }
      return value;
    }

    var declared = registration[1](_export, registration[1].length === 2 ? {
      import: function _import(importId) {
        return loader.import(importId, id);
      },
      meta: loader.createContext(id)
    } : undefined);

    load.e = declared.execute || function () {};

    return [registration[0], declared.setters || []];
  });
  if (TRACING) instantiatePromise = instantiatePromise.catch(function (err) {
    loader.onload(load.id, err);
    throw err;
  });
  var linkPromise = instantiatePromise.then(function (instantiation) {
    return Promise.all(instantiation[0].map(function (dep, i) {
      var setter = instantiation[1][i];
      return Promise.resolve(loader.resolve(dep, id)).then(function (depId) {
        var depLoad = getOrCreateLoad(loader, depId, id); // depLoad.I may be undefined for already-evaluated

        return Promise.resolve(depLoad.I).then(function () {
          if (setter) {
            depLoad.i.push(setter); // only run early setters when there are hoisted exports of that module
            // the timing works here as pending hoisted export calls will trigger through importerSetters

            if (depLoad.h || !depLoad.I) setter(depLoad.n);
          }

          return depLoad;
        });
      });
    })).then(function (depLoads) {
      load.d = depLoads;
    });
  }); // disable unhandled rejections

  linkPromise.catch(function () {}); // Captial letter = a promise function

  return load = loader[REGISTRY][id] = {
    id: id,
    // importerSetters, the setters functions registered to this dependency
    // we retain this to add more later
    i: importerSetters,
    // module namespace object
    n: ns,
    // instantiate
    I: instantiatePromise,
    // link
    L: linkPromise,
    // whether it has hoisted exports
    h: false,
    // On instantiate completion we have populated:
    // dependency load records
    d: undefined,
    // execution function
    // set to NULL immediately after execution (or on any failure) to indicate execution has happened
    // in such a case, pC should be used, and pLo, pLi will be emptied
    e: undefined,
    // On execution we have populated:
    // the execution error if any
    eE: undefined,
    // in the case of TLA, the execution promise
    E: undefined,
    // On execution, pLi, pLo, e cleared
    // Promise for top-level completion
    C: undefined
  };
}

function instantiateAll(loader, load, loaded) {
  if (!loaded[load.id]) {
    loaded[load.id] = true; // load.L may be undefined for already-instantiated

    return Promise.resolve(load.L).then(function () {
      return Promise.all(load.d.map(function (dep) {
        return instantiateAll(loader, dep, loaded);
      }));
    });
  }
}

function topLevelLoad(loader, load) {
  return load.C = instantiateAll(loader, load, {}).then(function () {
    return postOrderExec(loader, load, {});
  }).then(function () {
    return load.n;
  });
} // the closest we can get to call(undefined)


var nullContext = Object.freeze(Object.create(null)); // returns a promise if and only if a top-level await subgraph
// throws on sync errors

function postOrderExec(loader, load, seen) {
  if (seen[load.id]) return;
  seen[load.id] = true;

  if (!load.e) {
    if (load.eE) throw load.eE;
    if (load.E) return load.E;
    return;
  } // deps execute first, unless circular


  var depLoadPromises;
  load.d.forEach(function (depLoad) {
    if (TRACING) {
      try {
        var depLoadPromise = postOrderExec(loader, depLoad, seen);
        if (depLoadPromise) (depLoadPromises = depLoadPromises || []).push(depLoadPromise);
      } catch (err) {
        loader.onload(load.id, err);
        throw err;
      }
    } else {
      var _depLoadPromise = postOrderExec(loader, depLoad, seen);

      if (_depLoadPromise) (depLoadPromises = depLoadPromises || []).push(_depLoadPromise);
    }
  });

  if (depLoadPromises) {
    if (TRACING) return Promise.all(depLoadPromises).then(doExec).catch(function (err) {
      loader.onload(load.id, err);
      throw err;
    });else return load.E = Promise.all(depLoadPromises).then(doExec);
  }

  return doExec();

  function doExec() {
    try {
      var execPromise = load.e.call(nullContext);

      if (execPromise) {
        if (TRACING) execPromise = execPromise.then(function () {
          load.C = load.n;
          load.E = null; // indicates completion

          loader.onload(load.id, null);
        }, function (err) {
          loader.onload(load.id, err);
          throw err;
        });else execPromise.then(function () {
          load.C = load.n;
          load.E = null;
        });
        execPromise.catch(function () {});
        return load.E = load.E || execPromise;
      } // (should be a promise, but a minify optimization to leave out Promise.resolve)


      load.C = load.n;
      if (TRACING) loader.onload(load.id, null);
    } catch (err) {
      if (TRACING) loader.onload(load.id, err);
      load.eE = err;
      throw err;
    } finally {
      load.L = load.I = undefined;
      load.e = null;
    }
  }
}

_common.global.System = new SystemJS();