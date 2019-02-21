"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveIfNotPlainOrUrl = resolveIfNotPlainOrUrl;
exports.parseImportMap = parseImportMap;
exports.resolveImportMap = resolveImportMap;
exports.throwBare = throwBare;
exports.baseUrl = exports.global = exports.hasSelf = void 0;
var hasSelf = typeof self !== 'undefined';
exports.hasSelf = hasSelf;
var envGlobal = hasSelf ? self : global;
exports.global = envGlobal;
var baseUrl;
exports.baseUrl = baseUrl;

if (typeof location !== 'undefined') {
  exports.baseUrl = baseUrl = location.href.split('#')[0].split('?')[0];
  var lastSepIndex = baseUrl.lastIndexOf('/');
  if (lastSepIndex !== -1) exports.baseUrl = baseUrl = baseUrl.slice(0, lastSepIndex + 1);
}

var backslashRegEx = /\\/g;

function resolveIfNotPlainOrUrl(relUrl, parentUrl) {
  if (relUrl.indexOf('\\') !== -1) relUrl = relUrl.replace(backslashRegEx, '/'); // protocol-relative

  if (relUrl[0] === '/' && relUrl[1] === '/') {
    return parentUrl.slice(0, parentUrl.indexOf(':') + 1) + relUrl;
  } // relative-url
  else if (relUrl[0] === '.' && (relUrl[1] === '/' || relUrl[1] === '.' && (relUrl[2] === '/' || relUrl.length === 2 && (relUrl += '/')) || relUrl.length === 1 && (relUrl += '/')) || relUrl[0] === '/') {
      var parentProtocol = parentUrl.slice(0, parentUrl.indexOf(':') + 1); // Disabled, but these cases will give inconsistent results for deep backtracking
      //if (parentUrl[parentProtocol.length] !== '/')
      //  throw new Error('Cannot resolve');
      // read pathname from parent URL
      // pathname taken to be part after leading "/"

      var pathname;

      if (parentUrl[parentProtocol.length + 1] === '/') {
        // resolving to a :// so we need to read out the auth and host
        if (parentProtocol !== 'file:') {
          pathname = parentUrl.slice(parentProtocol.length + 2);
          pathname = pathname.slice(pathname.indexOf('/') + 1);
        } else {
          pathname = parentUrl.slice(8);
        }
      } else {
        // resolving to :/ so pathname is the /... part
        pathname = parentUrl.slice(parentProtocol.length + (parentUrl[parentProtocol.length] === '/'));
      }

      if (relUrl[0] === '/') return parentUrl.slice(0, parentUrl.length - pathname.length - 1) + relUrl; // join together and split for removal of .. and . segments
      // looping the string instead of anything fancy for perf reasons
      // '../../../../../z' resolved to 'x/y' is just 'z'

      var segmented = pathname.slice(0, pathname.lastIndexOf('/') + 1) + relUrl;
      var output = [];
      var segmentIndex = -1;

      for (var i = 0; i < segmented.length; i++) {
        // busy reading a segment - only terminate on '/'
        if (segmentIndex !== -1) {
          if (segmented[i] === '/') {
            output.push(segmented.slice(segmentIndex, i + 1));
            segmentIndex = -1;
          }
        } // new segment - check if it is relative
        else if (segmented[i] === '.') {
            // ../ segment
            if (segmented[i + 1] === '.' && (segmented[i + 2] === '/' || i + 2 === segmented.length)) {
              output.pop();
              i += 2;
            } // ./ segment
            else if (segmented[i + 1] === '/' || i + 1 === segmented.length) {
                i += 1;
              } else {
                // the start of a new segment as below
                segmentIndex = i;
              }
          } // it is the start of a new segment
          else {
              segmentIndex = i;
            }
      } // finish reading out the last segment


      if (segmentIndex !== -1) output.push(segmented.slice(segmentIndex));
      return parentUrl.slice(0, parentUrl.length - pathname.length) + output.join('');
    }
}
/*
 * Import maps implementation
 * 
 * To make lookups fast we pre-resolve the entire import map
 * and then match based on backtracked hash lookups
 * 
 */


function resolveUrl(relUrl, parentUrl) {
  return resolveIfNotPlainOrUrl(relUrl, parentUrl) || relUrl.indexOf(':') !== -1 && relUrl || resolveIfNotPlainOrUrl('./' + relUrl, parentUrl);
}

function resolvePackages(pkgs) {
  var outPkgs = {};

  for (var p in pkgs) {
    var value = pkgs[p]; // TODO package fallback support

    if (typeof value !== 'string') continue;
    outPkgs[resolveIfNotPlainOrUrl(p) || p] = value;
  }

  return outPkgs;
}

function parseImportMap(json, baseUrl) {
  var imports = resolvePackages(json.imports) || {};
  var scopes = {};

  if (json.scopes) {
    for (var scopeName in json.scopes) {
      var scope = json.scopes[scopeName];
      var resolvedScopeName = resolveUrl(scopeName, baseUrl);
      if (resolvedScopeName[resolvedScopeName.length - 1] !== '/') resolvedScopeName += '/';
      scopes[resolvedScopeName] = resolvePackages(scope) || {};
    }
  }

  return {
    imports: imports,
    scopes: scopes,
    baseUrl: baseUrl
  };
}

function getMatch(path, matchObj) {
  if (matchObj[path]) return path;
  var sepIndex = path.length;

  do {
    var segment = path.slice(0, sepIndex + 1);
    if (segment in matchObj) return segment;
  } while ((sepIndex = path.lastIndexOf('/', sepIndex - 1)) !== -1);
}

function applyPackages(id, packages, baseUrl) {
  var pkgName = getMatch(id, packages);

  if (pkgName) {
    var pkg = packages[pkgName];
    if (pkg === null) if (id.length > pkgName.length && pkg[pkg.length - 1] !== '/') console.warn("Invalid package target " + pkg + " for '" + pkgName + "' should have a trailing '/'.");
    return resolveUrl(pkg + id.slice(pkgName.length), baseUrl);
  }
}

function resolveImportMap(id, parentUrl, importMap) {
  var urlResolved = resolveIfNotPlainOrUrl(id, parentUrl);
  if (urlResolved) id = urlResolved;
  var scopeName = getMatch(parentUrl, importMap.scopes);

  if (scopeName) {
    var scopePackages = importMap.scopes[scopeName];
    var packageResolution = applyPackages(id, scopePackages, scopeName);
    if (packageResolution) return packageResolution;
  }

  return applyPackages(id, importMap.imports, importMap.baseUrl) || urlResolved || throwBare(id, parentUrl);
}

function throwBare(id, parentUrl) {
  throw new Error('Unable to resolve bare specifier "' + id + (parentUrl ? '" from ' + parentUrl : '"'));
}