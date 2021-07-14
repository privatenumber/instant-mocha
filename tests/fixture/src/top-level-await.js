const { add: addPure } = await import('./add');

export function add(x, y) {
	return addPure(x, y);
}
