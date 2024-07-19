import { internalCommands } from '$lib/commandManager/commandLib/Handler.js';
import type { commandValueObject } from '$lib/commandManager/commandLib/UtilityTypes';
import { json } from '@sveltejs/kit';

import Logger from '$lib/logger/index.js';
const logIt = Logger.getLogger('api parent/argument');
export const POST = async ({ params, request }) => {
	const formData = await request.formData();
	const value = formData.get('value');
	if (value == null) {
		logIt.error('Value not given');
		return json({
			invalid: true,
			options: []
		});
	}
	const values = formData.get('values');
	if (!values) {
		logIt.error('Values not given');
		return json({
			invalid: true,
			options: []
		});
	}

	const command = params.parentCommand;
	const internalCommand = internalCommands.find((cmd) => cmd.name == command);
	if (!internalCommand) {
		logIt.error('Command not found');
		return json({
			invalid: true,
			options: []
		});
	}

	const argument = params.argument;
	const internalArgument = internalCommand.arguments.find((arg) => arg.name == argument);
	if (!internalArgument) {
		logIt.error('Argument not found');
		return json({
			invalid: true,
			options: []
		});
	}

	const valuesObject = JSON.parse(values as string) as commandValueObject;
	const parsedValueObject: commandValueObject = {
		options: {},
		arguments: []
	};
	valuesObject.arguments.forEach((arg, i) => {
		const argument = internalCommand.arguments[i];
		const parsedValue = argument.parser(arg as string, parsedValueObject);
		parsedValueObject.arguments.push(parsedValue);
	});
	Object.entries(valuesObject.options).forEach(([key, opt]) => {
		const option = internalCommand.options[key];
		const parsedValue = option.parser(opt as string, parsedValueObject);
		parsedValueObject.options[key] = parsedValue;
	});

	try {
		const parsed = internalArgument.parser(value as string, parsedValueObject);
		logIt.debug(`parse(${value}): ${parsed}`);
		const valid = internalArgument.validator(parsed, parsedValueObject);
		logIt.debug(`validate(${parsed}): ${valid ? 'valid' : 'invalid'}`);
		const autoCompletes = internalArgument.autoCompleter(parsed, parsedValueObject);
		logIt.debug(`autocomplete(${parsed}): ${autoCompletes.join(', ')}`);

		return json({
			invalid: !valid,
			options: autoCompletes
		});
	} catch {
		logIt.error('command invalid');
		return json({
			invalid: true,
			options: []
		});
	}
};
