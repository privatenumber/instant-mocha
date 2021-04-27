import assert from 'assert';
import { last } from 'lodash-es';
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
