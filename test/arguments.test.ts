import {MainCommandInterface} from '../index.d';
import {serial, TestInterface} from 'ava';

interface Context {
	command(argv?: string[]): MainCommandInterface;
}

const test = serial as TestInterface<Context>;

test.before(() => {
	process.setMaxListeners(12);
	// @ts-ignore
	global.process.exit = () => {}; // tslint:disable-line:no-empty
	global.console.log = () => {}; // tslint:disable-line:no-empty
});

test.beforeEach(t => {
	// tslint:disable-next-line:no-require-imports
	const {Command} = require('../source');
	t.context = {
		command: argv => new Command(argv)
	};
});

test.cb('#undefined - default', t => {
	const m = t.context.command(['--verbose']);

	m.setup(p => {
		p.flags('--title').string();
		p.flags('--foo').string();
	});

	m.task(p => {
		p.run(proc => {
			t.is(proc.get(), undefined);
			t.is(proc.get(), undefined);
			t.is(proc.get('--verbose'), undefined);
			t.is(proc.get('--title'), undefined);
			t.is(proc.get('--foo'), undefined);
			t.end();
		});
	});
});

test.cb('#undefined - command', t => {
	const m = t.context.command(['cake', '--foo', '--noop']);

	m.task('cake', p => {
		p.run(proc => {
			t.is(proc.get('--foo'), undefined);
			t.is(proc.get('--noop'), undefined);
			t.end();
		});
	});
});

test.cb('#boolean - default false', t => {
	const m = t.context.command();

	m.setup(p => {
		p.flags('--help').as('-h');
		p.flags('--verbose').as('-V').boolean();
		p.flags('--production').as('-p').boolean(false);
	});

	m.task(p => {
		p.run(proc => {
			t.false(proc.get('--help'));
			t.false(proc.get('--verbose'));
			t.false(proc.get('--production'));
			t.false(proc.get('-h'));
			t.false(proc.get('-V'));
			t.false(proc.get('-p'));
			t.end();
		});
	});
});

test.cb('#boolean', t => {
	const m = t.context.command(['--verbose']);

	m.setup(p => {
		p.flags('--production').as('-p').boolean();
		p.flags('--verbose').as('-V').boolean(false);
	});

	m.task(p => {
		p.run(proc => {
			t.true(proc.get('--verbose'));
			t.true(proc.get('-V'));
			t.false(proc.get('--help'));
			t.false(proc.get('--version'));
			t.false(proc.get('--production'));
			t.false(proc.get('-p'));
			t.end();
		});
	});
});

test.cb('#boolean - negation', t => {
	const m = t.context.command(['--no-color', '--no-foo']);

	m.setup(p => {
		p.flags('--foo').boolean(false);
		p.flags('--color').boolean(true);
	});

	m.task(p => {
		p.run(proc => {
			t.false(proc.get('--foo'));
			t.false(proc.get('--color'));
			t.end();
		});
	});
});

test.cb('#string', t => {
	const m = t.context.command([
		'--env', 'production',
		'--out-dir', 'path/to/dist',
		'--title', 'unicorn',
		'--name'
	]);

	m.setup(p => {
		p.flags('--env').as('-e').string('development');
		p.flags('--out-dir').as('-D').string('/tmp/dist');
		p.flags('--config').as('-c').string('path/to/config');
	});

	m.task(p => {
		p.flags('--title').string();
		p.flags('--name').string();
		p.run(proc => {
			t.is(proc.get('--env'), 'production');
			t.is(proc.get('--out-dir'), 'path/to/dist');
			t.is(proc.get('--config'), 'path/to/config');
			t.is(proc.get('-e'), 'production');
			t.is(proc.get('-D'), 'path/to/dist');
			t.is(proc.get('-c'), 'path/to/config');
			t.is(proc.get('--name'), '');
			t.is(proc.get('--title'), 'unicorn');
			t.end();
		});
	});
});

test.cb('#number', t => {
	const m = t.context.command(['--max', '5', '--concurrency', '4']);

	m.setup(p => {
		p.flags('--size').as('-s').number(2);
		p.flags('--max').as('-M').number(10);
		p.flags('--concurrency').as('-C').number(2);
	});

	m.task(p => {
		p.run(proc => {
			t.is(proc.get('--size'), 2);
			t.is(proc.get('--max'), 5);
			t.is(proc.get('--concurrency'), 4);
			t.is(proc.get('-s'), 2);
			t.is(proc.get('-M'), 5);
			t.is(proc.get('-C'), 4);
			t.end();
		});
	});
});

test.cb('#argv', t => {
	const packages = [
		'express',
		'webpack',
		'@babel/core',
		'@babel/preset-env',
		'@babel/preset-react',
	];

	const m = t.context.command(['install', '--save-dev', ...packages]);

	m.task('install', p => {
		p.argv('package-name');
		p.flags('--save-dev').as('-D');

		p.run(proc => {
			t.true(proc.get('--save-dev'));
			t.true(proc.get('-D'));
			t.is(proc.argv.length, 5);
			t.is(proc.argv[0], 'express');
			t.is(proc.argv[4], '@babel/preset-react');
			t.deepEqual(proc.argv, [
				'express',
				'webpack',
				'@babel/core',
				'@babel/preset-env',
				'@babel/preset-react',
			]);
			t.end();
		});
	});
});

test.cb('#argv - populate', t => {
	const m = t.context.command(['cake', 'foo', '--bar', '--', '--aa', '--bb', 'baz']);

	m.task('cake', p => {
		p.run(proc => {
			t.deepEqual(proc.argv, ['foo']);
			t.is(proc.get('--bar'), undefined);
			t.deepEqual(proc['--'], ['--aa', '--bb', 'baz']);
			t.end();
		});
	});
});

test.cb('#flag - get multiple flags', t => {
	const m = t.context.command(['cake', 'foo', '--noop', '--bar', '--baz', 'quux', '--max', '4']);

	m.task('cake', p => {
		p.flags('--bar');
		p.flags('--baz').string();
		p.flags('--max').number();

		p.run(proc => {
			const a = proc.get(['--noop', '--bar']);
			const b = proc.get(['--baz', '--bar', '--max']);

			t.deepEqual(proc.argv, ['foo']);
			t.deepEqual(a, [undefined, true]);
			t.deepEqual(b, ['quux', true, 4]);
			t.end();
		});
	});
});
