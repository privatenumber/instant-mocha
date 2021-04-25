import assert from 'assert';
import { add } from '~/index';

it('should add', () => {
	assert(
		add(1, 1) === 2,
		'1 + 1 = 2',
	);
});
