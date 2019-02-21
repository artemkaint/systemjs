"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _systemCore = require("../system-core");

var _common = require("../common");

/*
 * Supports loading System.register in workers
 */
if (_common.hasSelf && typeof importScripts === 'function') _systemCore.systemJSPrototype.instantiate = function (url) {
  var loader = this;
  return new Promise(function (resolve, reject) {
    try {
      importScripts(url);
    } catch (e) {
      reject(e);
    }

    resolve(loader.getRegister());
  });
};
var _default = _systemCore.systemJSPrototype;
exports.default = _default;