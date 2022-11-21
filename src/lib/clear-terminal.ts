// https://github.com/sindresorhus/ansi-escapes/blob/b10a9b8430318cd65a11dc84a1080b3193960516/index.js#L85
const ESC = '\u001B[';
const eraseScreen = `${ESC}2J`;
export const clearTerminal = process.platform === 'win32'
	? `${eraseScreen}${ESC}0f`
	// 1. Erases the screen (Only done in case `2` is not supported)
	// 2. Erases the whole screen including scrollback buffer
	// 3. Moves cursor to the top-left position
	// More info: https://www.real-world-systems.com/docs/ANSIcode.html
	: `${eraseScreen}${ESC}3J${ESC}H`;
