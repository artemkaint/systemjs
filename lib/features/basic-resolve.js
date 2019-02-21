"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _systemCore = require("../system-core.js");

var _common = require("../common.js");

_systemCore.systemJSPrototype.resolve = function (id, parentUrl) {
  var resolved = (0, _common.resolveIfNotPlainOrUrl)(id, parentUrl || _common.baseUrl);

  if (!resolved) {
    if (id.indexOf(':') !== -1) return id;
    throw new Error('Cannot resolve "' + id + (parentUrl ? '" from ' + parentUrl : '"'));
  }

  return resolved;
};

var _default = _systemCore.systemJSPrototype;
exports.default = _default;