import assert from 'assert';
import fs from 'fs';
import { last } from 'array-last';
import { add } from '~/add';

it('should add', () => {
	assert(
		add(1, 1) === 2,
		'1 + 1 = 2',
	);
});

it('should load esm', () => {
	assert(
		last([1, 2, 3]) === 3,
		'should be 3',
	);
});

it('should access fs', () => {
	const dirFiles = fs.readdirSync(__dirname);
	assert(
		dirFiles.includes('passing-test.js'),
		'should find self',
	);
});
