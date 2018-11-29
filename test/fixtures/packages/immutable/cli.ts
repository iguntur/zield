import m from '../../../../source';

m.task('foo', '#1 - Foo', p => {
	p.run(() => {
		console.log('foo 1');
	});
});

m.task('foo', '#2 - Foo', p => {
	p.run(() => {
		throw new Error('Not ran');
	});
});
