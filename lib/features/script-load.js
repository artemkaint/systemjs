"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _systemCore = require("../system-core");

/*
 * Supports loading System.register via script tag injection
 */
var err;
if (typeof window !== 'undefined') window.addEventListener('error', function (e) {
  err = e.error;
});
var systemRegister = _systemCore.systemJSPrototype.register;

_systemCore.systemJSPrototype.register = function (deps, declare) {
  err = undefined;
  systemRegister.call(this, deps, declare);
};

_systemCore.systemJSPrototype.instantiate = function (url, firstParentUrl) {
  var loader = this;
  return new Promise(function (resolve, reject) {
    var script = document.createElement('script');
    script.charset = 'utf-8';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.addEventListener('error', function () {
      reject(new Error('Error loading ' + url + (firstParentUrl ? ' from ' + firstParentUrl : '')));
    });
    script.addEventListener('load', function () {
      document.head.removeChild(script); // Note URL normalization issues are going to be a careful concern here

      if (err) return reject(err);else resolve(loader.getRegister());
    });
    script.src = url;
    document.head.appendChild(script);
  });
};

var _default = _systemCore.systemJSPrototype;
exports.default = _default;