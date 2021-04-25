import assert from 'assert';
import { add } from '~/dynamic-import';

it('should add', async () => {
	assert(
		await add(1, 1) === 2,
		'1 + 1 = 2',
	);
});
