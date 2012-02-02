/*jslint node: true, maxlen: 80, indent: 4 */

var fs = require('fs'),
    path = require('path'),
    vm = require('vm');
module.exports = function (file, mocks, all) {
    var context, // the global context the file will run under
        libPath, // the resolved path of the lib to require
        script; // the vm.Script object created from the file contents
    context = {
        module : {
            exports : {}
        }
    };

    // include the exports variable, so user can use this as an alternative to
    // module.exports
    context.exports = context.module.exports;
    
    // include timer variables
    context.setTimeout = setTimeout;
    context.clearTimeout = clearTimeout;
    context.setInterval = setInterval;
    context.clearInterval = clearInterval;

    // include other globals, which also helps with errors
    context.console = console;
    context.process = process;
    context.global = global;
    
    // sort out the __filename and __dirname
    context.__filename = path.resolve(file);
    context.__dirname = path.dirname(context.__filename);

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

            // make sure we adjust the path correctly, relative to the
            // injectr'd file
            libPath = path.resolve(path.join(path.dirname(file), lib));

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
