import path from 'path';
import execa from 'execa';

const instantMocha = path.resolve('./bin/instant-mocha.js');

test('running tests', async () => {
	const { exitCode, stdout } = await execa(instantMocha, [
		'--webpackConfig',
		'webpack.config.js',
		'tests/passing-test.js',
	], {
		cwd: path.resolve('tests/fixture'),
	}).catch(error => error);

	expect(exitCode).toBe(0);
	expect(stdout).toMatch('1 passing');
});

test('exit-code on failure', async () => {
	const { exitCode, stdout } = await execa(instantMocha, [
		'--webpackConfig',
		'webpack.config.js',
		'tests/failing-test.js',
	], {
		cwd: path.resolve('tests/fixture'),
	}).catch(error => error);

	expect(exitCode).toBe(1);
	expect(stdout).toMatch('2 failing');
});

test('custom reporter', async () => {
	const { exitCode, stdout } = await execa(instantMocha, [
		'--webpackConfig',
		'webpack.config.js',
		'--reporter',
		'custom-reporter.js',
		'tests/failing-test.js',
	], {
		cwd: path.resolve('tests/fixture'),
	}).catch(error => error);

	expect(exitCode).toBe(1);
	expect(stdout).toMatch('Custom failure message');
});

test('dynamic import', async () => {
	const { exitCode, stdout } = await execa(instantMocha, [
		'--webpackConfig',
		'webpack.config.js',
		'tests/dynamic-import-test.js',
	], {
		cwd: path.resolve('tests/fixture'),
	}).catch(error => error);

	expect(exitCode).toBe(0);
	expect(stdout).toMatch('1 passing');
});
