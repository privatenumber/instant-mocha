import { describe } from 'manten';

describe('instant-mocha', ({ runTestSuite }) => {
	runTestSuite(import('./specs/cli.js'));
	// runTestSuite(import('./specs/instant-mocha.js'));
});
