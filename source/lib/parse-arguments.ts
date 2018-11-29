import {MainFlagSchema, IContextFlagSchema, ParseContextArgvInterface, ICommandAttribute} from '../types.d';
import yargs from 'yargs-parser';
import buildFlagsOptions from './build-flags-options';

export function buildContextArgument(schema: IContextFlagSchema): ParseContextArgvInterface {
	const {'--': passthrough, _: argv, ...flags} = schema;

	return {
		'--': passthrough || [],
		argv: argv.slice(),
		flags
	};
}

export function parseInputArguments(argv: typeof process.argv, flags: MainFlagSchema, configuration: any = {}) {
	const flagsSchema = buildFlagsOptions(flags);
	const yargsOptions = {
		...flagsSchema,
		configuration: {
			'populate--': true,
			...configuration
		}
	};

	const parsed = yargs(argv, yargsOptions);

	return buildContextArgument(parsed as IContextFlagSchema);
}

export default function parseArguments(argv: string[], schema: ICommandAttribute): ParseContextArgvInterface {
	return parseInputArguments(argv, schema.flags);
}
