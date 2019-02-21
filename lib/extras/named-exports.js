"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/*
 * Named exports support for legacy module formats in SystemJS 2.0
 */
(function () {
  var systemPrototype = System.constructor.prototype; // hook System.register to know the last declaration binding

  var lastRegisterDeclare;
  var systemRegister = systemPrototype.register;

  systemPrototype.register = function (deps, declare) {
    lastRegisterDeclare = declare;
    systemRegister.call(this, deps, declare);
  };

  var getRegister = systemPrototype.getRegister;

  systemPrototype.getRegister = function () {
    var register = getRegister.call(this); // if it is an actual System.register call, then its ESM
    // -> dont add named exports

    if (!register || register[1] === lastRegisterDeclare || register[1].length === 0) return register; // otherwise it was provided by a custom instantiator
    // -> extend the registration with named exports support

    var registerDeclare = register[1];

    register[1] = function (_export, _context) {
      // hook the _export function to note the default export
      var defaultExport;
      var declaration = registerDeclare.call(this, function (name, value) {
        if (name === 'default') defaultExport = value;

        _export(name, value);
      }, _context); // hook the execute function

      var execute = declaration.execute;
      if (execute) declaration.execute = function () {
        execute.call(this); // do a bulk export of the default export object
        // to export all its names as named exports

        if (_typeof(defaultExport) === 'object') _export(defaultExport);
      };
      return declaration;
    };

    return register;
  };
})();