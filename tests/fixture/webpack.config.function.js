const path = require('path');

function createFunction() {

	/** @type {import('webpack').Configuration} */
	const config = {
		mode: 'production',
		resolve: {
			alias: {
				'~': path.resolve(__dirname, 'src/'),
			},
		},
	};

	return config;
}

module.exports = createFunction;
