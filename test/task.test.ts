// tslint:disable:no-require-imports
import {serial as test} from 'ava';

test.before(() => {
	// @ts-ignore
	global.process.exit = () => {}; // tslint:disable-line:no-empty
	global.console.log = () => {}; // tslint:disable-line:no-empty
});

test('.task() - error', t => {
	const m = require('../source');
	t.throws(() => m.task(), TypeError);
});

test('.task("name") - error no handler', t => {
	const m = require('../source');
	t.throws(() => m.task('*'), TypeError);
});

test('.task("name", "description") - error no handler', t => {
	const m = require('../source');
	t.throws(() => m.task('name', 'description'), TypeError);
});

test.cb('.task("name", Function) - no error', t => {
	const {Command} = require('../source');
	const m = new Command(['name']);
	m.task('name', p => {
		p.run(() => {
			t.pass();
			t.end();
		});
	});
});

test.cb('.task("name", "description", Function) - no error', t => {
	const {Command} = require('../source');
	const m = new Command(['name']);
	m.task('name', 'description', p => {
		p.run(() => {
			t.pass();
			t.end();
		});
	});
});

test.cb('example task', t => {
	const {Command} = require('../source');
	const m = new Command(['example']);

	m.task(p => {
		p.run(() => {
			t.fail();
		});
	});

	m.task('task:not:ran', p => {
		p.run(() => {
			t.fail();
		});
	});

	m.task('example', 'build description', p => {
		p.run(() => {
			t.pass();
			t.end();
		});
	});
});

test.cb('default task', t => {
	const m = require('../source');
	m.task(p => {
		p.run(() => {
			t.pass();
			t.end();
		});
	});
});

test.cb('immutable task', t => {
	const {Command} = require('../source');
	const m = new Command(['foo']);

	m.task('foo', p => {
		p.run(() => {
			t.pass();
			t.end();
		});
	});

	m.task('foo', p => {
		p.run(() => {
			t.fail();
		});
	});
});
