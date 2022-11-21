import { testSuite, expect } from 'manten';
import { instantMocha } from '../utils.mjs'; // eslint-disable-line import/extensions

export default testSuite(({ describe }) => {
	describe('cli', ({ test }) => {
		test('shows help', async () => {
			const { exitCode, stdout } = await instantMocha(['--help']);

			expect(exitCode).toBe(0);
			expect(stdout.trim()).toMatch('Build tests with Webpack and run them with Mocha');
		});

		test('shows interfaces', async () => {
			const { exitCode, stdout } = await instantMocha(['--list-interfaces']);

			expect(exitCode).toBe(0);
			expect(stdout.trim()).toMatch('BDD or RSpec style');
		});

		test('shows reporters', async () => {
			const { exitCode, stdout } = await instantMocha(['--list-reporters']);

			expect(exitCode).toBe(0);
			expect(stdout.trim()).toMatch('HTML documentation');
		});
	});
});
