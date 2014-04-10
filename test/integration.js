"use strict";

var expect = require("expect.js"),
    fs = require('fs');

describe("basic injectr", function () {
    beforeEach(function (done) {
        var fileContent,
            self = this;
        this.testFileDirectory = __dirname + '/test-scripts/';
        this.testFile = this.testFileDirectory + 'test-file.js';
        this.relativeTestFile = './test-scripts/test-file.js';
        this.testRequire = 'test-require.js';
        this.testRequire2 = '../test-require2.js';
        this.injectr = require('../lib/injectr');
        fileContent = 'module.exports = {' +
            '    a : "result",' +
            '    b : function () {' +
            '        return require("fs");' +
            '    },' +
            '    c : function () {' +
            '        return require("./' + this.testRequire + '");' +
            '    },' +
            '    d : function () {' +
            '        return require("' + this.testRequire2 + '");' +
            '    }' +
            '};';
        fs.exists(this.testFileDirectory, function (exists) {
            var testFilesToDo = 3,
                write;
            write = function () {
                var complete = function () {
                    if (--testFilesToDo === 0) {
                        done();
                    }
                };
                fs.writeFile(
                    self.testFile,
                    fileContent,
                    complete
                );
                fs.writeFile(
                    self.testFileDirectory + self.testRequire,
                    'module.exports = 4;',
                    complete
                );
                fs.writeFile(
                    self.testFileDirectory + self.testRequire2,
                    'module.exports = 5;',
                    complete
                );
            };
            if (!exists) {
                fs.mkdir(self.testFileDirectory, write);
            } else {
                write();
            }
        });
    });
    afterEach(function (done) {
        var self = this,
            testFilesToDo = 2,
            complete = function () {
                if (--testFilesToDo === 0) {
                    fs.rmdir(self.testFileDirectory, done);
                }
            };
        fs.unlink(this.testFile, complete);
        fs.unlink(self.testFileDirectory + self.testRequire, complete);
        fs.unlink(self.testFileDirectory + self.testRequire2, complete);
    });
    it("should load and run scripts, and return the result", function () {
        var mod = this.injectr(this.relativeTestFile);
        expect(mod).to.have.property('a', 'result');
    });
    it("should run scripts replacing mocks with passed objects", function () {
        var mod,
            mockFs = {};
        mod = this.injectr(this.relativeTestFile, {
            fs : mockFs
        });
        expect(mod.b()).to.equal(mockFs);
    });
    it("should successfully resolve dirs to the mocking file", function () {
        var mod;
        mod = this.injectr(this.relativeTestFile, {
        });
        expect(mod.c()).to.equal(4);
    });
    it("should successfully resolve dirs to a ../ file", function () {
        var mod;
        mod = this.injectr(this.relativeTestFile, {
        });
        expect(mod.d()).to.equal(5);
    });
});
