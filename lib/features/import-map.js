"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _common = require("../common.js");

var _systemCore = require("../system-core.js");

/*
 * Import map support for SystemJS
 *
 * <script type="systemjs-importmap">{}</script>
 * OR
 * <script type="systemjs-importmap" src=package.json></script>
 *
 * Only supports loading the first import map
 */
var importMap, importMapPromise;

if (typeof document !== 'undefined') {
  var scripts = document.getElementsByTagName('script');

  var _loop2 = function _loop2(i) {
    var script = scripts[i];
    if (script.type !== 'systemjs-importmap') return "continue";

    if (!script.src) {
      importMap = (0, _common.parseImportMap)(JSON.parse(script.innerHTML), _common.baseUrl);
    } else {
      importMapPromise = fetch(script.src).then(function (res) {
        return res.json();
      }).then(function (json) {
        importMap = (0, _common.parseImportMap)(json, script.src);
      });
    }

    return "break";
  };

  _loop: for (var i = 0; i < scripts.length; i++) {
    var _ret = _loop2(i);

    switch (_ret) {
      case "continue":
        continue;

      case "break":
        break _loop;
    }
  }
}

importMap = importMap || {
  imports: {},
  scopes: {}
};

_systemCore.systemJSPrototype.resolve = function (id, parentUrl) {
  parentUrl = parentUrl || _common.baseUrl;
  if (importMapPromise) return importMapPromise.then(function () {
    return (0, _common.resolveImportMap)(id, parentUrl, importMap);
  });
  return (0, _common.resolveImportMap)(id, parentUrl, importMap);
};

var _default = _systemCore.systemJSPrototype;
exports.default = _default;