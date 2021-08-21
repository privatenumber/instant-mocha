import fs from 'fs';
import path from 'path';
import execa from 'execa';

const collectStdout = (buffers: Buffer[]) => new Promise<string>(
	(resolve) => {
		buffers.push = function (...arguments_) {
			const returnValue = Array.prototype.push.apply(buffers, arguments_);
			const stdout = Buffer.concat(buffers).toString().trim();
			if (/(passing|failing)/.test(stdout)) {
				buffers.splice(0);
				resolve(stdout);
			}

			return returnValue;
		};
	},
);
const instantMocha = path.resolve('./bin/instant-mocha.js');

describe.each([
	['Webpack 5', []],
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

		expect(stdout).toMatch('3 passing');
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

	test('function config', async () => {
		const { exitCode, stdout } = await execa('node', [
			...webpackVersion,
			instantMocha,
			'--webpackConfig',
			'webpack.config.function.js',
			'tests/passing-test.js',
		], {
			cwd: path.resolve('tests/fixture'),
		}).catch(error => error);

		expect(stdout).toMatch('3 passing');
		expect(exitCode).toBe(0);
	});

	test('watch tests', async () => {
		const stdoutBuffers = [];

		const instantMochaWatch = execa('node', [
			...webpackVersion,
			instantMocha,
			'--webpackConfig',
			'webpack.config.js',
			'tests/passing-test.js',
			'--watch',
		], {
			cwd: path.resolve('tests/fixture'),
		});

		instantMochaWatch.stdout.on('data', (data) => {
			stdoutBuffers.push(data);
		});

		const stdoutPassing = await collectStdout(stdoutBuffers);
		expect(stdoutPassing).toMatch('3 passing');

		const passingTestPath = './tests/fixture/tests/passing-test.js';
		const passingTestSource = (await fs.promises.readFile(passingTestPath)).toString();

		await fs.promises.writeFile(passingTestPath, passingTestSource.replace('=== 3', '=== 4'));

		const stdoutFailing = await collectStdout(stdoutBuffers);
		expect(stdoutFailing).toMatch('2 passing');

		await fs.promises.writeFile(passingTestPath, passingTestSource);

		const stdoutPassing2 = await collectStdout(stdoutBuffers);
		expect(stdoutPassing2).toMatch('3 passing');

		instantMochaWatch.cancel();
	}, 20000);
});

test('top level await', async () => {
	const { exitCode, stdout } = await execa('node', [
		instantMocha,
		'--webpackConfig',
		'webpack.config.top-level-await.js',
		'tests/top-level-await.js',
	], {
		cwd: path.resolve('tests/fixture'),
	}).catch(error => error);

	expect(stdout).toMatch('2 passing');
	expect(exitCode).toBe(0);
});
