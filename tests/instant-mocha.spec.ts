import path from 'path';
import execa from 'execa';

const instantMocha = path.resolve('./bin/instant-mocha.js');

describe.each([
	// ['Webpack 5', []],
	['Webpack 4', ['-r', '../use-webpack4.js']],
])('%s', (_name, webpackVersion) => {
	test('running tests', async () => {
		const { exitCode, stdout } = await execa('node', [
			...webpackVersion,
			instantMocha,
			'--webpackConfig',
			'webpack.config.js',
			'tests/passing-test.js',
		], {
			cwd: path.resolve('tests/fixture'),
		}).catch(error => error);

		expect(stdout).toMatch('1 passing');
		expect(exitCode).toBe(0);
	});

	test('exit-code on failure', async () => {
		const { exitCode, stdout } = await execa('node', [
			...webpackVersion,
			instantMocha,
			'--webpackConfig',
			'webpack.config.js',
			'tests/failing-test.js',
		], {
			cwd: path.resolve('tests/fixture'),
		}).catch(error => error);

		expect(stdout).toMatch('2 failing');
		expect(exitCode).toBe(1);
	});

	test('custom reporter', async () => {
		const { exitCode, stdout } = await execa('node', [
			...webpackVersion,
			instantMocha,
			'--webpackConfig',
			'webpack.config.js',
			'--reporter',
			'custom-reporter.js',
			'tests/failing-test.js',
		], {
			cwd: path.resolve('tests/fixture'),
		}).catch(error => error);

		expect(stdout).toMatch('Custom failure message');
		expect(exitCode).toBe(1);
	});

	test('dynamic import', async () => {
		const { exitCode, stdout } = await execa('node', [
			...webpackVersion,
			instantMocha,
			'--webpackConfig',
			'webpack.config.js',
			'tests/dynamic-import-test.js',
		], {
			cwd: path.resolve('tests/fixture'),
		}).catch(error => error);

		expect(stdout).toMatch('1 passing');
		expect(exitCode).toBe(0);
	});

	test('custom assertion library - chai', async () => {
		const { exitCode, stdout } = await execa('node', [
			...webpackVersion,
			instantMocha,
			'--webpackConfig',
			'webpack.config.js',
			'tests/using-chai.js',
		], {
			cwd: path.resolve('tests/fixture'),
		}).catch(error => error);

		expect(stdout).toMatch('1 passing');
		expect(exitCode).toBe(0);
	});
});
