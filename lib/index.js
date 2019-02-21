"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "scriptLoad", {
  enumerable: true,
  get: function get() {
    return _scriptLoad2.default;
  }
});
Object.defineProperty(exports, "workerLoad", {
  enumerable: true,
  get: function get() {
    return _workerLoad2.default;
  }
});
Object.defineProperty(exports, "global", {
  enumerable: true,
  get: function get() {
    return _global2.default;
  }
});
Object.defineProperty(exports, "wasmLoad", {
  enumerable: true,
  get: function get() {
    return _wasmLoad2.default;
  }
});
Object.defineProperty(exports, "importMap", {
  enumerable: true,
  get: function get() {
    return _importMap2.default;
  }
});
Object.defineProperty(exports, "registry", {
  enumerable: true,
  get: function get() {
    return _registry2.default;
  }
});

var _scriptLoad2 = _interopRequireDefault(require("./features/script-load"));

var _workerLoad2 = _interopRequireDefault(require("./features/worker-load"));

var _global2 = _interopRequireDefault(require("./extras/global"));

var _wasmLoad2 = _interopRequireDefault(require("./features/wasm-load"));

var _importMap2 = _interopRequireDefault(require("./features/import-map"));

var _registry2 = _interopRequireDefault(require("./features/registry"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }