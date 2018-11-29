import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

const externals = () => {
	const nodeBuiltIn = ['fs', 'path', 'events', 'util', 'os', 'stream'];
	return [
		...nodeBuiltIn,
		...Object.keys(pkg.dependencies)
	];
};

export default [
	{
		input: 'source/index.ts',
		external: externals(),
		plugins: [
			typescript({
				cacheRoot: 'node_modules/.cache/rollup-plugin-typescript2/rpt2-cache',
				tsconfigOverride: {
					compilerOptions: {
						module: 'es2015'
					}
				}
			}),
			commonjs({
				exclude: ['node_modules/**/*'],
				extensions: ['.js', '.ts']
			})
		],
		output: [
			{
				file: `dist/${pkg.main}`,
				format: 'cjs',
				exports: 'named'
			}
		]
	}
];
