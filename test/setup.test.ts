// tslint:disable:no-require-imports
import test from 'ava';

test('.setup() - error', t => {
	const m = require('../source');
	t.throws(() => m.setup(), TypeError);
});
