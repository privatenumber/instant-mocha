const mocha = require('mocha');

function customReporter(runner) {
	mocha.reporters.Base.call(this, runner);

	runner.on('fail', (test, error) => {
		console.log('Custom failure message: %s -- error: %s', test.fullTitle(), error.message);
	});
}

module.exports = customReporter;
