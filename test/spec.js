/*jslint node: true, plusplus: true, stupid: true, nomen: true, indent: 4, maxlen: 80 */
/*global afterEach: false,
    beforeEach: false,
    describe: false,
    it: false,
    should: false */

"use strict";

var expect = require("expect.js"),
	injectr = require("../lib/injectr"),
	pretendr = require("pretendr");

describe("injectr", function () {
    beforeEach(function () {
		this.mockFs = pretendr({
		    readFileSync : function () {}
		});
		this.mockPath = pretendr({
		    join : function () {},
		    dirname : function () {}
		});
		this.mockVm = pretendr({
		    createScript : function () {}
		});
		this.mockVm.createScript.template({
		    runInNewContext : function () {},
		    runInThisContext : function () {}
		});
		this.mockCoffeeScript = pretendr({
		    compile : function () {}
		});

		// this.injectr is the injectr under test
		// the injectr var is being used to test it
        this.injectr = injectr('./lib/injectr.js', {
			fs : this.mockFs.mock,
			path : this.mockPath.mock,
			vm : this.mockVm.mock,
			'coffee-script' : this.mockCoffeeScript.mock
		});
    });
	it("should read in the selected file", function () {
		var lib = this.injectr('filename');
		expect(this.mockFs.readFileSync.calls).to.have.length(1);
		expect(this.mockFs.readFileSync.calls[0].args)
			.to.have.property(0, 'filename')
			.and.to.have.property(1, 'utf8');
	});
	it("should only read the file once per file", function () {
	    this.mockFs.readFileSync.returnValue('dummy');
	    this.injectr('filename');
	    this.injectr('filename');
	    expect(this.mockFs.readFileSync.calls).to.have.length(1);
	    this.injectr('filename2');
	    this.injectr('filename2');
	    expect(this.mockFs.readFileSync.calls).to.have.length(2);
	});
	it("should create a script from the file", function () {
	    var call,
	        lib;
	    this.mockFs.readFileSync.returnValue('dummy script');
	    lib = this.injectr('filename');
	    expect(this.mockVm.createScript.calls).to.have.length(1);
	    call = this.mockVm.createScript.calls[0];
	    expect(call.args[0]).to.equal('dummy script');
	    expect(call.args[1]).to.equal('filename');
	});
	it("should run the script in a new context", function () {
	    var mockScript,
	        lib;
	    lib = this.injectr('filename');
	    mockScript = this.mockVm.createScript.calls[0].pretendr;
	    expect(mockScript.runInNewContext.calls).to.have.length(1);
	});
	it("should have a predefined module.exports", function () {
        var context,
            mockScript,
            l;
        l = this.injectr('filename');
        mockScript = this.mockVm.createScript.calls[0].pretendr;
        context = mockScript.runInNewContext.calls[0].args[0];
        expect(context).to.have.property('module');
        expect(context.module).to.have.property('exports');
        expect(context.module.exports).to.be.an('object');
	});
	it("should return module.exports", function () {
        var context,
            mockScript,
            l;
        l = this.injectr('filename');
        mockScript = this.mockVm.createScript.calls[0].pretendr;
        context = mockScript.runInNewContext.calls[0].args[0];
        expect(l).to.equal(context.module.exports);
	});
	it("should allow an onload callback", function () {
	    var mockCb = pretendr(function () {});
	    this.mockFs.readFileSync.returnValue('before');
	    mockCb.returnValue('after');
	    this.injectr.onload = mockCb.mock;
	    this.injectr('filename');
	    expect(mockCb.calls).to.have.length(1);
	    expect(mockCb.calls[0].args).to.have.property(0, 'filename')
	        .and.to.have.property(1, 'before');
	    expect(this.mockVm.createScript.calls[0].args[0]).to.equal('after');
	});
	it("should only run the callback once per file", function () {
	    var mockCb = pretendr(function () {});
	    mockCb.returnValue('dummy');
	    this.injectr.onload = mockCb.mock;
	    this.injectr('filename');
	    this.injectr('filename');
	    expect(mockCb.calls).to.have.length(1);
	});
	describe("require function", function () {
	    it("should get mock libraries if provided", function () {
	        var context,
	            customLib = {},
	            mockScript,
	            l;
            l = this.injectr('filename', {
                customLib : customLib
            });
	        mockScript = this.mockVm.createScript.calls[0].pretendr;
	        context = mockScript.runInNewContext.calls[0].args[0];
	        expect(context.require('customLib')).to.equal(customLib);
	    });
	    it("should require libraries otherwise", function () {
	        var context,
	            mockScript,
	            l;
	        l = this.injectr('filename', {});
	        mockScript = this.mockVm.createScript.calls[0].pretendr;
	        context = mockScript.runInNewContext.calls[0].args[0];
	        expect(JSON.stringify(context.require('fs')))
	            .to.eql(JSON.stringify(require('fs')));
	    });
	    it("should resolve directories to the injectr'd file", function () {
	        var args,
	            l,
	            mockScript,
	            req;
	        l = this.injectr('filename');
	        mockScript = this.mockVm.createScript.calls[0].pretendr;
	        req = mockScript.runInNewContext.calls[0].args[0].require;
	        this.mockPath.dirname.returnValue('/directory/');
	        this.mockPath.join.returnValue('fs');
	        req('./a-local-module');
	        args = this.mockPath.dirname.calls[0].args;
	        expect(args).to.have.property(0, 'filename');
	        args = this.mockPath.join.calls[0].args;
	        expect(args[0]).to.equal('/directory/');
	        expect(args[1]).to.equal('./a-local-module');
	        expect(JSON.stringify(l)).to.equal(JSON.stringify(require('fs')));
	    });
	    it("should compile coffee-script files before running", function () {
	        var out;
	        this.mockCoffeeScript.compile.returnValue('compiled');
	        out = this.injectr.onload('file.coffee', 'uncompiled');
	        expect(out).to.equal('compiled');
	        this.mockCoffeeScript.compile.returnValue('another compiled');
	        out = this.injectr.onload('another.coffee', '');
	        expect(out).to.equal('another compiled');
	        out = this.injectr.onload('non-coffee', 'javascript');
	        expect(out).to.equal('javascript');
	    });
	});
	describe("with context argument", function () {
	    it("should use the provided context to run the script", function () {
	        var context = {},
	            mockScript;
	        this.injectr('filename', null, context);
	        mockScript = this.mockVm.createScript.calls[0].pretendr;
	        expect(mockScript.runInNewContext.calls[0].args[0])
	            .to.equal(context);
	    });
	    it("should still have module and require objects", function () {
	        var context = {};
	        this.injectr('filename', null, context);
	        expect(context).to.have.property('module')
	            .and.to.have.property('require');
	    });
	});
});
