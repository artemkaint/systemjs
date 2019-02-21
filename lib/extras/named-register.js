"use strict";

/*
 * SystemJS named register extension
 * Supports System.register('name', [..deps..], function (_export, _context) { ... })
 * 
 * Names are written to the registry as-is
 * System.register('x', ...) can be imported as System.import('x')
 */
(function () {
  var systemJSPrototype = System.constructor.prototype;
  var constructor = System.constructor;

  var SystemJS = function SystemJS() {
    constructor.call(this);
    this.registerRegistry = Object.create(null);
  };

  SystemJS.prototype = systemJSPrototype;
  System = new SystemJS();
  var register = systemJSPrototype.register;

  systemJSPrototype.register = function (name, deps, declare) {
    if (typeof name !== 'string') return register.apply(this, arguments);
    this.registerRegistry[name] = [deps, declare]; // Provide an empty module to signal success.

    return register.call(this, [], function () {
      return {};
    });
  };

  var resolve = systemJSPrototype.resolve;

  systemJSPrototype.resolve = function (id, parentURL) {
    if (id[0] === '/' || id[0] === '.' && (id[1] === '/' || id[1] === '.' && id[2] === '/')) return resolve.call(this, id, parentURL);
    if (id in this.registerRegistry) return id;
    return resolve.call(this, id, parentURL);
  };

  var instantiate = systemJSPrototype.instantiate;

  systemJSPrototype.instantiate = function (url, firstParentUrl) {
    return this.registerRegistry[url] || instantiate.call(this, url, firstParentUrl);
  };
})();