const Module = require('module');

const { require: originalRequire } = Module.prototype;
Module.prototype.require = function (specifier) {
	specifier = specifier.replace(/^mocha(\/.+)?$/, 'mocha8$1');
	return originalRequire.call(this, specifier);
};
