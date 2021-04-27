import { assert } from 'chai';
import { add } from '~/add';

it('should add', () => {
	assert(
		add(1, 1) === 2,
		'1 + 1 = 2',
	);
});
