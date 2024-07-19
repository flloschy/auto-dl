import logger, { Logger } from '$lib/logger';
import {
	messageColors,
	type commandValueObject,
	type internalAsyncExecutionFunction,
	type logMessage
} from './UtilityTypes';

function offsetTimeStamp(start: number) {
	const diff = Date.now() - start;
	const time = new Date(diff);

	const hours = (time.getHours() - 1).toString().padStart(2, '0');
	const minutes = time.getMinutes().toString().padStart(2, '0');
	const seconds = time.getSeconds().toString().padStart(2, '0');

	return [hours, minutes, seconds].join(':');
}

export class ExecutionHandler {
	private logs: logMessage[] = [];
	private start: number;
	private streams: Set<ReadableStreamDefaultController>;
	private finished = -1;
	private id: string;
	private logger: Omit<Logger, 'getLogger'>;
	constructor(id: string, executor: internalAsyncExecutionFunction, values: commandValueObject) {
		this.id = id;
		this.logger = logger.getLogger('task (' + id + ')');
		this.streams = new Set<ReadableStreamDefaultController>();
		this.start = Date.now();
		this.logger.debug('started');
		executor(this, values);
	}

	log(value: logMessage, replace?: boolean) {
		this.logger.debug(
			`${replace ? '^ ' : ''}${value.map((v) => (typeof v == 'string' ? v : v.message)).join(' ')}`
		);
		if (replace && this.logs.length > 0) {
			this.logs[this.logs.length - 1] = value;
		} else {
			this.logs.push(value);
		}

		if (this.streams.size != 0) {
			// this.logger.debug(`pushing message to ${this.streams.size} clients`)
			for (const stream of this.streams) {
				stream.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(this.logs)}\n\n`));
			}
		}
	}

	done(error?: boolean) {
		this.log(['']);
		this.log([`Finished in ${offsetTimeStamp(this.start)}`]);
		this.log([
			{
				message: `exit code ${error ? '1' : '0'}`,
				color: error ? messageColors.red : messageColors.green
			}
		]);
		this.finished = Date.now();
		this.streams.clear();
		setTimeout(
			() => {
				delete runningTasks[this.id];
			},
			1000 * // total: 1 second
				60 * // total: 1 minute
				60 * // total: 1 hour
				24 * // total: 1 day
				2 // total: 2 days
		);
	}
}

let createdTasks = 0;
export const runningTasks: { [key: string]: ExecutionHandler } = {};

export function createTask(func: internalAsyncExecutionFunction, values: commandValueObject) {
	createdTasks++;
	const id = createdTasks.toString();
	runningTasks[id] = new ExecutionHandler(id, func, values);
	return id;
}
