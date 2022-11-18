import path from 'path';
import execa from 'execa';
import { bin } from '../package.json';

const instantMocha = path.resolve(bin);

test('shows help', async () => {
	const { exitCode, stdout } = await execa(instantMocha, ['--help']);

	expect(exitCode).toBe(0);
	expect(stdout.trim()).toMatch('Build tests with Webpack and run them with Mocha');
});

test('shows interfaces', async () => {
	const { exitCode, stdout } = await execa(instantMocha, ['--list-interfaces']);

	expect(exitCode).toBe(0);
	expect(stdout.trim()).toMatch('BDD or RSpec style');
});

test('shows reporters', async () => {
	const { exitCode, stdout } = await execa(instantMocha, ['--list-reporters']);

	expect(exitCode).toBe(0);
	expect(stdout.trim()).toMatch('HTML documentation');
});
