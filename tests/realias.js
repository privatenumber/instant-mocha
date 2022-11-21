const Module = require('module');

const { ALIASES } = process.env;
const aliases = ALIASES ? JSON.parse(ALIASES) : {};

const resolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
	if (!request.startsWith('.')) {
		const segments = request.split('/');
		const foundAlias = aliases[segments[0]];
		if (foundAlias) {
			segments[0] = foundAlias;
			request = segments.join('/');
		}
	}

	return resolveFilename.call(this, request, parent, isMain, options);
};
