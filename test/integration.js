/*jslint node: true, plusplus: true, stupid: true, nomen: true, indent: 4, maxlen: 80 */
/*global afterEach: false,
    beforeEach: false,
    describe: false,
    it: false,
    should: false */

"use strict";

var expect = require("expect.js"),
    fs = require('fs'),
	injectr = require("../lib/injectr");

describe("basic injectr", function () {
    beforeEach(function (done) {
        var fileContent,
            self = this;
        this.testFileDirectory = __dirname + '/test-scripts/';
        this.testFile = this.testFileDirectory + 'test-file.js';
        this.testRequire = 'test-require.js';
        this.injectr = require('../lib/injectr');
        fileContent = 'module.exports = {' +
            '    a : "result",' +
            '    b : function () {' +
            '        return require("fs");' +
            '    },' +
            '    c : function () {' +
            '        return require("./' + this.testRequire + '");' +
            '    }' +
            '};';
        fs.exists(this.testFileDirectory, function (exists) {
            var testFileDone = false,
                testRequireDone = false,
                write;
            write = function () {
                fs.writeFile(
                    self.testFile,
                    fileContent,
                    function () {
                        if (testRequireDone) {
                            return done();
                        }
                        testFileDone = true;
                    }
                );
                fs.writeFile(
                    self.testFileDirectory + self.testRequire,
                    'module.exports = 4;',
                    function () {
                        if (testFileDone) {
                            return done();
                        }
                        testRequireDone = true;
                    }
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
        var self = this;
        fs.unlink(this.testFile, function () {
            fs.unlink(self.testFileDirectory + self.testRequire, function () {
                fs.rmdir(self.testFileDirectory, done);
            });
        });
    });
    it("should load and run scripts, and return the result", function () {
        var mod = this.injectr(this.testFile);
        expect(mod).to.have.property('a', 'result');
    });
    it("should run scripts replacing mocks with passed objects", function () {
        var mod,
            mockFs = {};
        mod = this.injectr(this.testFile, {
            fs : mockFs
        });
        expect(mod.b()).to.equal(mockFs);
    });
    it("should successfully resolve dirs to the mocking file", function () {
        var mod,
            mockFs = {};
        mod = this.injectr(this.testFile, {
        });
        expect(mod.c()).to.equal(4);
    });
});
