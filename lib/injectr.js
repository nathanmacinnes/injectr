/*jslint node: true, plusplus: true, stupid: true, nomen: true, indent: 4, maxlen: 80 */

"use strict";

var cache = {},
    fs = require('fs'),
    vm = require('vm');

module.exports = function (file, mocks) {
    var contents,
        context,
        script;
    if (!cache[file]) {
        cache[file] = fs.readFileSync(file, 'utf8');
    }
    script = vm.createScript(cache[file], file);
    context = {
        require : function (a) {
            if (mocks[a]) {
                return mocks[a];
            }
            return require(a);
        },
        module : {
            exports : {}
        }
    };
    script.runInNewContext(context);
    return context.module.exports;
};
