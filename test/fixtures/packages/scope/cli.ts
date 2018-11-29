import m from '../../../../source';

m.task('scope:pass', p => {
	p.run(proc => {
		proc.log('%s', 'foo');
	});
});

m.task('scope:fail', p => {
	p.run(proc => {
		proc.fatal('error');
	});
});
