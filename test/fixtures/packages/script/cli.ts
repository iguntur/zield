import m from '../../../../source';

function randomNumber(min: number, max: number) {
	const n = (max - min + 1) + min;
	return Math.floor(Math.random() * n);
}

const delay = async (ms: number) => new Promise(resolve => setTimeout(() => resolve(), ms));

function fakeProcess(name) {
	return async (_, next) => {
		console.log('[start] %s', name);
		await delay(randomNumber(1000, 3000));
		console.log('[end]   %s', name);
		next();
	};
}

m.task(c => {
	c.run(() => {
		console.log('default task');
	});
});

m.task('build', 'Build application', c => {
	c.flags('--production').as('-p', '-R').describe('Build for production mode');
	c.use(fakeProcess('lint'));
	c.use(fakeProcess('cleanup'));
	c.use(fakeProcess('build'));
	c.run(() => {
		console.log('done');
	});
});

m.task('start', 'Start application', p => {
	p.use(fakeProcess('cleanup'), (_, next) => {
		console.log('running webpack watch');
		next();
	});
	p.run(() => {
		console.log('server running on localhost:3000');
	});
});

m.task('test:package', 'Running test', p => {
	p.use(fakeProcess('cleanup'));
	p.run(fakeProcess('test:lint'), fakeProcess('test:unit'), () => {
		console.log('testing done');
	});
});

m.task('install', 'Install packages', p => {
	p.argv('<package-name>').describe('The package name to install');
	p.flags('--verbose').describe('Verbose the output');
	p.flags('--save-dev').describe('Install as devDependencies');
	p.run(() => {
		//
	});
});
