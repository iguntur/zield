import {SetupCommandInterface, FlagInterface} from '../../index.d';
import {MainFlagSchema} from '../types.d';
import {BuildFlagAttribute} from './build-flag-attribute';

export default class SetupCommand implements SetupCommandInterface {
	protected state: MainFlagSchema;

	constructor() {
		this.state = {};
	}

	flags(input: string): FlagInterface {
		const flag = new BuildFlagAttribute(input);

		// @ts-ignore
		this.state[input] = flag.state;

		return flag;
	}
}
