var runner = require('qunit');

runner.run({
    code : { path: './lib/injectr.js', namespace : 'injectr' },
    tests : './test/tests.js'
});
