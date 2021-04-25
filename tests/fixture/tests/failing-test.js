import assert from 'assert';
import { add } from '~/add';

it('should add - expect to fail', () => {
	assert(
		add(1, 1) === 3,
		'1 + 1 = 3',
	);
});

it('should add - expect to fail', () => {
	assert(
		add(1, 1) === 4,
		'1 + 1 = 4',
	);
});
