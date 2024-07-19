/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArgumentBuilder, InternalArgument, InternalOption, OptionBuilder } from './Argument';
import type {
	executionFunction,
	frontEndReadyCommand,
	frontEndReadySubCommand
} from './UtilityTypes';
import Logger from '$lib/logger';
export class InternalCommand {
	name = '';
	description = '';
	arguments: InternalArgument[] = [];
	options: { [key: string]: InternalOption } = {};
	subCommands: { [key: string]: InternalSubCommand } = {};
	// @ts-expect-error its ok
	executor: executionFunction<any> = () => [['ok']];

	frontEndReadyObject(): frontEndReadyCommand {
		Logger.getLogger('command ' + this.name).debug('preparing for frontend');
		return {
			name: this.name,
			description: this.description,
			arguments: this.arguments.map((argument) => argument.frontEndReadyObject()),
			options: Object.fromEntries(
				Object.entries(this.options).map(([key, option]) => [key, option.frontEndReadyObject()])
			),
			subCommands: Object.fromEntries(
				Object.entries(this.subCommands).map(([key, subCommand]) => [
					key,
					subCommand.frontEndReadyObject()
				])
			)
		};
	}
}

export class CommandBuilder {
	private internal = new InternalCommand();
	private logger = Logger.getLogger('Command Builder');

	setName(name: string) {
		this.logger.debug('changing name -> ' + name);
		this.logger = Logger.getLogger('Command Builder ' + name);
		this.internal.name = name;
		return this;
	}
	setDescription(description: string) {
		this.logger.debug('description: ' + description);
		this.internal.description = description;
		return this;
	}
	addArgument(argument: ArgumentBuilder<any> | ArgumentBuilder<any>[]) {
		if (Array.isArray(argument)) {
			argument.forEach((arg) => this.addArgument(arg));
			return;
		}
		// @ts-expect-error internal is private but still can be accessed after compiling
		this.logger.debug(
			'Adding argument: ' + argument.internal.name + ' [' + argument.internal.typeString + ']'
		);
		// @ts-expect-error internal is private but still can be accessed after compiling
		this.internal.arguments.push(argument.internal);
		return this;
	}
	addOption(option: OptionBuilder<any> | OptionBuilder<any>[]) {
		if (Array.isArray(option)) {
			option.forEach((opt) => this.addOption(opt));
			return;
		}
		// @ts-expect-error internal is private but still can be accessed after compiling
		this.logger.debug(
			'Adding option: ' + option.internal.name + ' [' + option.internal.typeString + ']'
		);
		// @ts-expect-error internal is private but still can be accessed after compiling
		this.internal.options[option.internal.name] = option.internal;
		return this;
	}
	addSubCommand(option: SubCommandBuilder) {
		// @ts-expect-error internal is private but still can be accessed after compiling
		const opt: InternalSubCommand = option.internal;
		this.logger.debug('Adding subcommand: ' + opt.name);
		this.internal.subCommands[opt.name] = opt;
		return this;
	}
	setExecutionFunction<T extends 'async' | 'instant'>(executor: executionFunction<T>) {
		this.logger.debug('executor set: ' + executor.name);
		this.internal.executor = executor;
		return this;
	}
}

export class InternalSubCommand {
	name = '';
	description = '';
	arguments: InternalArgument[] = [];
	options: { [key: string]: InternalOption } = {};
	// @ts-expect-error its ok
	executor: executionFunction<any> = () => [['ok']];

	frontEndReadyObject(): frontEndReadySubCommand {
		return {
			name: this.name,
			description: this.description,
			arguments: this.arguments.map((argument) => argument.frontEndReadyObject()),
			options: Object.fromEntries(
				Object.entries(this.options).map(([key, option]) => [key, option.frontEndReadyObject()])
			)
		};
	}
}

export class SubCommandBuilder {
	private internal = new InternalSubCommand();
	private logger = Logger.getLogger('SubCommand Builder');

	setName(name: string) {
		this.logger.debug('changing name -> ' + name);
		this.logger = Logger.getLogger('SubCommand Builder ' + name);
		this.internal.name = name;
		return this;
	}
	setDescription(description: string) {
		this.logger.debug('description: ' + description);
		this.internal.description = description;
		return this;
	}
	addArgument(argument: ArgumentBuilder<any> | ArgumentBuilder<any>[]) {
		if (Array.isArray(argument)) {
			argument.forEach((arg) => this.addArgument(arg));
			return this;
		}
		// @ts-expect-error internal is private but still can be accessed after compiling
		this.logger.debug(
			'Adding argument: ' + argument.internal.name + ' [' + argument.internal.typeString + ']'
		);
		// @ts-expect-error internal is private but still can be accessed after compiling
		this.internal.arguments.push(argument.internal);
		return this;
	}
	addOption(option: OptionBuilder<any> | OptionBuilder<any>[]) {
		if (Array.isArray(option)) {
			option.forEach((opt) => this.addOption(opt));
			return this;
		}
		// @ts-expect-error internal is private but still can be accessed after compiling
		this.logger.debug(
			'Adding option: ' + option.internal.name + ' [' + option.internal.typeString + ']'
		);
		// @ts-expect-error internal is private but still can be accessed after compiling
		this.internal.options[option.internal.name] = option.internal;
		return this;
	}

	setExecutionFunction<T extends 'async' | 'instant'>(executor: executionFunction<T>) {
		this.logger.debug('executor set: ' + executor.name);
		this.internal.executor = executor;
		return this;
	}
}
