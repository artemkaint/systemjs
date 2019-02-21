"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _systemCore = require("../system-core.js");

_systemCore.systemJSPrototype.get = function (id) {
  var load = this[_systemCore.REGISTRY][id];

  if (load && load.e === null && !load.E) {
    if (load.eE) return null;
    return load.n;
  }
}; // Delete function provided for hot-reloading use cases


_systemCore.systemJSPrototype.delete = function (id) {
  var load = this.get(id);
  if (load === undefined) return false; // remove from importerSetters
  // (release for gc)

  if (load && load.d) load.d.forEach(function (depLoad) {
    var importerIndex = depLoad.i.indexOf(load);
    if (importerIndex !== -1) depLoad.i.splice(importerIndex, 1);
  });
  return delete this[_systemCore.REGISTRY][id];
};

var _default = _systemCore.systemJSPrototype;
exports.default = _default;