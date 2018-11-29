export function long(input: string): string {
	const inputs = input.replace(/\s/g, '-').split('-').filter(str => str.trim() !== '');
	return '--' + inputs.join('-').toLowerCase().trim();
}

export function short(input: string): string {
	const inputs = input.split('-').filter(str => str.trim() !== '');
	return '-' + inputs.join('').trim();
}
