"use strict";

var cache = {},
    fs = require('fs'),
    path = require('path'),
    vm = require('vm');

module.exports = function (file, mocks, context) {
    var script;
    mocks = mocks || {};
    context = context || {};
    file = path.join(path.dirname(module.parent.filename), file);
    cache[file] = cache[file] || module.exports.onload(file,
        fs.readFileSync(file, 'utf8'));
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
    context.module = context.module || {};
    context.module.exports = {};
    context.exports = context.module.exports;

    script.runInNewContext(context);
    return context.module.exports;
};

module.exports.onload = function (file, content) {
    if (file.match(/\.coffee$/)) {
        return require('coffee-script').compile(content, {
            filename : file
        });
    }
    return content;
};
