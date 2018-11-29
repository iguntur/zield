import test from 'ava';
import {padEnd} from '../source/lib/str';

test('.padEnd()', t => {
	const a = padEnd(10, 'foo');
	t.is(a.length, 10);
	t.is(a, 'foo       ');

	const b = padEnd(5, 'abcdefg');
	t.is(b.length, 7);
	t.is(b, 'abcdefg');

	const c = [
		padEnd(10, 'abc'),
		padEnd(10, 'abcdef'),
		padEnd(10, 'abcdefghij'),
		padEnd(10, 'abcdefghhij klmn 123'),
	];
	t.deepEqual(c, [
		'abc       ',
		'abcdef    ',
		'abcdefghij',
		'abcdefghhij klmn 123',
	]);
});
