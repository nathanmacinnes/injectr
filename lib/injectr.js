/*jslint node: true, plusplus: true, stupid: true, nomen: true, indent: 4, maxlen: 80 */

"use strict";

var cache = {},
    fs = require('fs'),
    path = require('path'),
    vm = require('vm');

module.exports = function (file, mocks, context) {
    var contents,
        script;
    mocks = mocks || {};
    context = context || {};
    if (!cache[file]) {
        cache[file] = fs.readFileSync(file, 'utf8');
        if (module.exports.onload) {
            cache[file] = module.exports.onload(file, cache[file]);
        }
    }
    script = vm.createScript(cache[file], file);
    context.require = function (a) {
        if (mocks[a]) {
            return mocks[a];
        }
        if (a.indexOf('.') === 0) {
            a = path.join(path.dirname(file), a);
        }
        return require(a);
    };
    context.module = {
        exports : {}
    };
    script.runInNewContext(context);
    return context.module.exports;
};
