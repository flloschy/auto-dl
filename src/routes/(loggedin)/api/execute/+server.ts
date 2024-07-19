import type { InternalSubCommand } from '$lib/commandManager/commandLib/Command';
import { createTask } from '$lib/commandManager/commandLib/Execution';
import { internalCommands } from '$lib/commandManager/commandLib/Handler.js';
import type {
	commandValueObject,
	executionReturn
} from '$lib/commandManager/commandLib/UtilityTypes.js';
import { json } from '@sveltejs/kit';
import Logger from '$lib/logger';

const emptyReturn = (errMessage: string): executionReturn => ({
	redirect: false,
	result: {
		success: false,
		output: errMessage
	}
});

export const POST = async ({ request }) => {
	const logIt = Logger.getLogger('executor');
	const formData = await request.formData();
	const command = formData.get('command');
	if (command == null) {
		logIt.error('command not given');
		return json(emptyReturn('command not given'));
	}
	const internalCommand = internalCommands.find((cmd) => cmd.name == command);
	if (!internalCommand) {
		logIt.error("command doesn't exist");
		return json(emptyReturn("command doesn't exist"));
	}

	const subCommand = formData.get('subCommand');
	let internalSubCommand: undefined | null | InternalSubCommand = null;
	if (subCommand != null) {
		internalSubCommand = Object.values(internalCommand.subCommands).find(
			(cmd) => cmd.name == subCommand
		);
		if (internalSubCommand == undefined) {
			logIt.error("sub command doesn't exist");
			return json(emptyReturn("sub command doesn't exist"));
		}
	}

	const argumentsData = formData.get('argument');
	if (argumentsData == null) {
		logIt.error('arguments not given');
		return json(emptyReturn('arguments not given'));
	}
	const optionsData = formData.get('options');
	if (optionsData == null) {
		logIt.error('options not given');
		return json(emptyReturn('options not given'));
	}
	const argumentsList = JSON.parse(argumentsData as string);
	const optionsMap = JSON.parse(optionsData as string);

	const activeCommand = internalSubCommand ?? internalCommand;
	const parsedValueObject: commandValueObject = {
		options: {},
		arguments: []
	};

	let failed: string | undefined = undefined;
	argumentsList.forEach((arg, i) => {
		if (failed) return;
		const argument = activeCommand.arguments[i];
		const parsedValue = argument.parser(arg as string, parsedValueObject);
		if (!argument.validator(parsedValue, parsedValueObject)) {
			failed = `argument ${argument.name}: Not valid`;
		}
		parsedValueObject.arguments.push(parsedValue);
	});
	Object.entries(optionsMap).forEach(([key, opt]) => {
		if (failed) return;
		if (opt == '') return;
		if (!opt) return;
		const option = activeCommand.options[key];
		const parsedValue = option.parser(opt as string, parsedValueObject);
		if (!option.validator(parsedValue, parsedValueObject)) {
			failed = `option ${option.name}: Not valid`;
		}
		parsedValueObject.options[key] = parsedValue;
	});

	if (failed) {
		logIt.error(failed);
		return json(emptyReturn(failed));
	}

	const executor = await activeCommand.executor(parsedValueObject);
	if (typeof executor === 'function') {
		const id = createTask(executor, parsedValueObject);
		logIt.info('Async task starting to execute');
		return json({
			redirect: id,
			result: false
		});
	}

	(executor.success ? logIt.info : logIt.error)(
		`Instant task completion ${executor.success ? 'succeeded' : 'failed'} (${executor.lines ? executor.lines.length : 0} lines output)`
	);
	return json({
		redirect: false,
		result: {
			success: executor.success,
			output: executor.lines
		}
	});
};
