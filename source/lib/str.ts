/**
 * `String.prototype.padEnd` only work on version 8 or higher.
 *
 * See: https://node.green/#ES2017-features-String-padding-String-prototype-padEnd
 */
export function padEnd(maxLength: number, str: string) {
	if (maxLength > str.length) {
		return str + ' '.repeat(maxLength - str.length);
	}

	return str;
}
