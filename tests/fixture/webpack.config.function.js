const path = require('path');

function createFunction() {

	/** @type {import('webpack').Configuration} */
	const config = {
		mode: 'production',
		node: {
			__dirname: true,
		},
		resolve: {
			alias: {
				'~': path.resolve(__dirname, 'src/'),
			},
		},
	};

	return config;
}

module.exports = createFunction;
