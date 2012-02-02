var path = require('path');

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
