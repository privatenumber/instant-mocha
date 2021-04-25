export async function add(x, y) {
	const { add } = await import('./add');
	return add(x, y);
}
