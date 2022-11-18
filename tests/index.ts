import { describe } from 'manten';

describe('instant-mocha', ({ runTestSuite }) => {
	runTestSuite(import('./specs/cli.mjs')); // eslint-disable-line import/extensions
	runTestSuite(import('./specs/instant-mocha.mjs')); // eslint-disable-line import/extensions
});
