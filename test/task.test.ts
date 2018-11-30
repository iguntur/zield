// tslint:disable:no-require-imports
import {ZieldInterface} from '../index.d';
import {serial, TestInterface} from 'ava';

interface Context {
	z(argv?: string[]): ZieldInterface;
}

const test = serial as TestInterface<Context>;

test.before(() => {
	// @ts-ignore
	global.process.exit = () => {}; // tslint:disable-line:no-empty
	global.console.log = () => {}; // tslint:disable-line:no-empty
});

test.beforeEach(t => {
	// tslint:disable-next-line:no-require-imports
	const {Zield} = require('../source');
	t.context = {
		z: argv => new Zield(argv)
	};
});

test('.task() - error', t => {
	const m = t.context.z();
	// @ts-ignore
	t.throws(() => m.task(), TypeError);
});

test('.task("name") - error no handler', t => {
	const m = t.context.z();
	// @ts-ignore
	t.throws(() => m.task('*'), TypeError);
});

test('.task("name", "description") - error no handler', t => {
	const m = t.context.z();
	// @ts-ignore
	t.throws(() => m.task('name', 'description'), TypeError);
});

test.cb('.task("name", Function) - no error', t => {
	const m = t.context.z(['name']);
	m.task('name', p => {
		p.run(() => {
			t.pass();
			t.end();
		});
	});
});

test.cb('.task("name", "description", Function) - no error', t => {
	const m = t.context.z(['name']);
	m.task('name', 'description', p => {
		p.run(() => {
			t.pass();
			t.end();
		});
	});
});

test.cb('example task', t => {
	const m = t.context.z(['example']);

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
	const m = t.context.z();
	m.task(p => {
		p.run(() => {
			t.pass();
			t.end();
		});
	});
});

test.cb('immutable task', t => {
	const m = t.context.z(['foo']);
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
