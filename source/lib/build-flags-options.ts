import {MainFlagSchema, FlagAttributeState, IYargsOptions} from '../types.d';

export default function buildFlagsOptions(flagSchema: MainFlagSchema) {
	if (!flagSchema || Object.keys(flagSchema).length === 0) {
		return {};
	}

	const options: IYargsOptions = {
		default: {},
		alias: {},
		string: [],
		number: [],
		boolean: [],
	};

	const setTypes = (attr: FlagAttributeState, flagName: string) => {
		switch (attr.type) {
			case 'string':
			case 'boolean':
			case 'number':
			default:
				options[attr.type].push(flagName);
		}
	};

	const addAliases = (attr: FlagAttributeState, flagName: string) => {
		if (!attr.alias) {
			return;
		}

		([] as string[]).concat(attr.alias).forEach(aliasName => {
			options.alias[aliasName] = flagName;
		});
	};

	function setOption(attr: FlagAttributeState, key: string, flagName) {
		if (key in attr) {
			options[key][flagName] = attr[key];
		}
	}

	Object.keys(flagSchema).forEach(flagName => {
		const attr = flagSchema[flagName];
		setOption(attr, 'default', flagName);
		addAliases(attr, flagName);
		setTypes(attr, flagName);
	});

	return options;
}
