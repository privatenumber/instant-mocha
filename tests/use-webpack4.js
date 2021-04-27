const Module = require('module');

const { require: originalRequire } = Module.prototype;
Module.prototype.require = function (specifier) {
	specifier = specifier.replace(/^webpack(\/.+)?$/, 'webpack4$1');
	return originalRequire.call(this, specifier);
};
