const Module = require('node:module');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..', '.tmp-contentops-tests');
const originalResolve = Module._resolveFilename;

Module._resolveFilename = function patchedResolve(request, parent, isMain, options) {
  if (request === 'server-only') {
    return path.resolve(__dirname, 'serverOnlyStub.cjs');
  }

  if (request.startsWith('@/')) {
    const mappedRequest = path.join(projectRoot, request.slice(2));
    return originalResolve.call(this, mappedRequest, parent, isMain, options);
  }

  return originalResolve.call(this, request, parent, isMain, options);
};
