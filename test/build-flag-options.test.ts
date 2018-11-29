import test from 'ava';
import m from '../source/lib/build-flags-options';

function validate(t, obj: object & {actual; expected}) {
	t.deepEqual(m(obj.actual), obj.expected);
}

test('1 - empty', validate, {
	actual: undefined,
	expected: {}
});

test('2 - empty', validate, {
	actual: null,
	expected: {}
});

test('3 - empty', validate, {
	actual: {},
	expected: {}
});

test('4 - empty', validate, {
	actual: [],
	expected: {}
});

test('#string', validate, {
	actual: {
		foobar: {
			type: 'string',
			default: 'foo',
			alias: ['f']
		}
	},
	expected: {
		default: {
			foobar: 'foo'
		},
		alias: {
			f: 'foobar'
		},
		string: ['foobar'],
		number: [],
		boolean: [],
	}
});

test('#boolean', validate, {
	actual: {
		verbose: {
			type: 'boolean',
			default: false,
			alias: ['V']
		},
	},
	expected: {
		default: {
			verbose: false,
		},
		alias: {
			V: 'verbose'
		},
		boolean: ['verbose'],
		number: [],
		string: [],
	}
});

test('#number', validate, {
	actual: {
		max: {
			type: 'number',
			alias: ['m']
		},
	},
	expected: {
		default: {},
		alias: {
			m: 'max'
		},
		number: ['max'],
		string: [],
		boolean: [],
	}
});

test('alias', validate, {
	actual: {
		username: {
			type: 'string',
			alias: 'u'
		}
	},
	expected: {
		default: {},
		alias: {
			u: 'username'
		},
		string: ['username'],
		boolean: [],
		number: [],
	}
});

test('multiple aliases', validate, {
	actual: {
		username: {
			type: 'string',
			alias: ['u', 'U']
		}
	},
	expected: {
		default: {},
		alias: {
			u: 'username',
			U: 'username',
		},
		string: ['username'],
		boolean: [],
		number: [],
	}
});

test('all', validate, {
	actual: {
		username: {
			type: 'string',
			default: '',
			alias: ['u']
		},
		verbose: {
			type: 'boolean',
			default: false,
			alias: ['V']
		},
		size: {
			type: 'number',
			alias: ['s']
		},
		message: {
			type: 'string',
			default: ''
		},
	},
	expected: {
		default: {
			username: '',
			verbose: false,
			message: '',
		},
		alias: {
			u: 'username',
			V: 'verbose',
			s: 'size',
		},
		boolean: ['verbose'],
		number: ['size'],
		string: ['username', 'message'],
	}
});
