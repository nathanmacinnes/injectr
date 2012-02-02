var path = require('path'),
    fs = require('fs');

test('will include the requested file', function () {
    var staticVars = injectr('./test/pretend-scripts/static-vars.js');
    equal(staticVars.one, 'this is a string');
    equal(staticVars.two, 2);
});
test('will require files correctly', function () {
    var requiredStaticVars = injectr(
        './test/pretend-scripts/require-static-vars.js');
    equal(requiredStaticVars.staticVars.one, 'this is a string');
    equal(requiredStaticVars.staticVars.two, 2);
});
test('will require modules correctly', function () {
    var requiredPath = injectr('./test/pretend-scripts/require-path.js');
    deepEqual(requiredPath.path, path);
});
test('will inject mocks', function () {
    var requiredPath = injectr('./test/pretend-scripts/require-path.js', {
        path : 'this is a mock'
    });
    equal(requiredPath.path, 'this is a mock');
    var requiredStaticVars = injectr(
        './test/pretend-scripts/require-static-vars.js',
        {
            './static-vars.js' : {
                one : 'a mock value'
            }
        });
    equal(requiredStaticVars.staticVars.one, 'a mock value');
});
test("will export values properly", function () {
    var exportTest = injectr('./test/pretend-scripts/export-test.js');
    equal(exportTest.exportedValue1, 'exported value');
});
test("can get local variables", function () {
    var exportTest = injectr('./test/pretend-scripts/export-test.js', {}, true);
    equal(exportTest.module.exports.exportedValue1, 'exported value',
        "exported values now available under .module.exports");
    equal(exportTest.localVar, 'local');
});
test("has the appropriate global variables", function () {
    var globals = injectr('./test/pretend-scripts/globals.js');
    equal(globals.setTimeout, setTimeout);
    equal(globals.clearTimeout, clearTimeout);
    equal(globals.setInterval, setInterval);
    equal(globals.clearInterval, clearInterval);
    equal(globals.console, console);
    equal(globals.process.argv, process.argv);
    equal(globals.process.pid, process.pid);
    equal(globals.global.urlParams, global.urlParams);
    equal(globals.global.isLocal, global.isLocal);
});
test("has __filename and __dirname values", function () {
    var globals = injectr('./test/pretend-scripts/globals.js');
    equal(globals.dirname, __dirname + '/pretend-scripts');
    equal(globals.filename, __dirname + '/pretend-scripts/globals.js');
});
test("will cache file contents for quick loading", function () {
    var filename = './test/pretend-scripts/new-file.js',
        oldContent = 'exports.val = 1;',
        newContent = 'exports.val = 2;',
        pre,
        post;
    fs.writeFileSync(filename, oldContent);
    pre = injectr(filename);
    equal(pre.val, 1, "sanity check that we've actually written properly");
    fs.writeFileSync(filename, newContent);
    post = injectr(filename);
    deepEqual(pre, post, "file hasn't been re-loaded");
    notEqual(pre, post, "but the same object isn't re-used");
});
