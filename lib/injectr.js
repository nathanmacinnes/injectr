var fs = require('fs'),
    path = require('path'),
    vm = require('vm');
module.exports = function (file, mocks, all) {
    var context, // the global context the file will run under
        libPath,
        script; // the vm.Script object created from the file contents
    context = {
        module : {
            exports : {}
        }
    };

    // mocks is an optional parameter
    // not including it makes injectr like a sandbox wrapper
    mocks = mocks || {};

    // use sync version because require is sync, so that's what the user expects
    data = fs.readFileSync(file, 'utf8');

    script = vm.createScript(data, file);

    // a wrapper for require... if the user has given a mock, use that
    context.require = function (lib) {
        if (mocks.hasOwnProperty(lib)) {
            return mocks[lib];
        } else if (lib.indexOf('.') === 0) {
            libPath = path.resolve(path.join(path.dirname(file), lib));
            // make sure we adjust the path correctly, relative to the
            // injectr'd file
            return require(libPath);
        } else {
            return require(lib);
        }
    };
    
    // run the included file
    script.runInNewContext(context);

    // if the user wants the whole object, not just the exports, give it to them
    if (all) {
        return context;
    }
    return context.module.exports;
};
