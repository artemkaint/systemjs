"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/*
 * Support for AMD loading
 */
(function (global) {
  var systemPrototype = System.constructor.prototype;
  var emptyInstantiation = [[], function () {
    return {};
  }];

  function unsupportedRequire() {
    throw new Error('AMD require not supported.');
  }

  function emptyFn() {}

  var requireExportsModule = ['require', 'exports', 'module'];

  function createAMDRegister(amdDefineDeps, amdDefineExec) {
    var exports = {};
    var module = {
      exports: exports
    };
    var depModules = [];
    var setters = [];
    var splice = 0;

    for (var i = 0; i < amdDefineDeps.length; i++) {
      var id = amdDefineDeps[i];
      var index = setters.length;

      if (id === 'require') {
        depModules[i] = unsupportedRequire;
        splice++;
      } else if (id === 'module') {
        depModules[i] = module;
        splice++;
      } else if (id === 'exports') {
        depModules[i] = exports;
        splice++;
      } else {
        (function () {
          // needed for ie11 lack of iteration scope
          var idx = i;
          setters.push(function (ns) {
            depModules[idx] = ns.default;
          });
        })();
      }

      if (splice) amdDefineDeps[index] = id;
    }

    if (splice) amdDefineDeps.length -= splice;
    var amdExec = amdDefineExec;
    return [amdDefineDeps, function (_export) {
      _export('default', exports);

      return {
        setters: setters,
        execute: function execute() {
          module.exports = amdExec.apply(exports, depModules) || module.exports;
          if (exports !== module.exports) _export('default', module.exports);
        }
      };
    }];
  } // hook System.register to know the last declaration binding


  var lastRegisterDeclare;
  var systemRegister = systemPrototype.register; // if we have named register support continue to use it

  if (systemRegister.length === 3) {
    systemPrototype.register = function (name, deps, declare) {
      if (typeof name !== 'string') lastRegisterDeclare = deps;
      systemRegister.apply(this, arguments);
    };
  } else {
    systemPrototype.register = function (deps, declare) {
      lastRegisterDeclare = declare;
      systemRegister.apply(this, arguments);
    };
  }

  var getRegister = systemPrototype.getRegister;

  systemPrototype.getRegister = function () {
    var register = getRegister.call(this); // if its an actual System.register leave it

    if (register && register[1] === lastRegisterDeclare) return register; // otherwise AMD takes priority
    // no registration -> attempt AMD detection

    if (!amdDefineDeps) return register || emptyInstantiation;
    var registration = createAMDRegister(amdDefineDeps, amdDefineExec);
    amdDefineDeps = null;
    return registration;
  };

  var amdDefineDeps, amdDefineExec;

  global.define = function (name, deps, execute) {
    // define('', [], function () {})
    if (typeof name === 'string') {
      if (amdDefineDeps) {
        if (!System.registerRegistry) throw new Error('Include the named register extension named AMD support in SystemJS.');
        System.registerRegistry[name] = createAMDRegister(deps, execute);
        amdDefineDeps = [];
        amdDefineExec = emptyFn;
        return;
      } else {
        if (System.registerRegistry) System.registerRegistry[name] = createAMDRegister(deps, execute);
        name = deps;
        deps = execute;
      }
    } // define([], function () {})


    if (name instanceof Array) {
      amdDefineDeps = name;
      amdDefineExec = deps;
    } // define({})
    else if (_typeof(name) === 'object') {
        amdDefineDeps = [];

        amdDefineExec = function amdDefineExec() {
          return name;
        };
      } // define(function () {})
      else if (typeof name === 'function') {
          amdDefineDeps = requireExportsModule;
          amdDefineExec = name;
        }
  };

  global.define.amd = {};
})(typeof self !== 'undefined' ? self : global);