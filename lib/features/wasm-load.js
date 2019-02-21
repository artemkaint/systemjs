"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _systemCore = require("../system-core");

/*
 * Loads WASM based on file extension detection
 * Assumes successive instantiate will handle other files
 */
var instantiate = _systemCore.systemJSPrototype.instantiate;

_systemCore.systemJSPrototype.instantiate = function (url, parent) {
  if (url.slice(-5) !== '.wasm') return instantiate.call(this, url, parent);
  return fetch(url).then(function (res) {
    if (!res.ok) throw new Error(res.status + ' ' + res.statusText + ' ' + res.url + (parent ? ' loading from ' + parent : ''));
    if (WebAssembly.compileStreaming) return WebAssembly.compileStreaming(res);
    return res.arrayBuffer().then(function (buf) {
      return WebAssembly.compile(buf);
    });
  }).then(function (module) {
    var deps = [];
    var setters = [];
    var importObj = {}; // we can only set imports if supported (eg early Safari doesnt support)

    if (WebAssembly.Module.imports) WebAssembly.Module.imports(module).forEach(function (impt) {
      var key = impt.module;
      setters.push(function (m) {
        importObj[key] = m;
      });
      if (deps.indexOf(key) === -1) deps.push(key);
    });
    return [deps, function (_export) {
      return {
        setters: setters,
        execute: function execute() {
          return WebAssembly.instantiate(module, importObj).then(function (instance) {
            _export(instance.exports);
          });
        }
      };
    }];
  });
};

var _default = _systemCore.systemJSPrototype;
exports.default = _default;