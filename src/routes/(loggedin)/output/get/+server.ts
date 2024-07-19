import { runningTasks } from '$lib/commandManager/commandLib/Execution';
import { error } from '@sveltejs/kit';
import Logger from '$lib/logger/index.js';

export async function GET({ url }) {
	const id = url.searchParams.get('id');
	const logIt = Logger.getLogger('stream manager ' + id);
	if (!id) {
		logIt.error('id not found');
		throw error(402, 'no ID given');
	}

	const exists = Object.keys(runningTasks).includes(id);
	if (!exists) {
		logIt.error('Task does not exist');
		throw error(404, "task doesn't exist");
	}

	const task = runningTasks[id];
	if (!task) {
		logIt.error('Task does not exist');
		throw error(404, "task doesn't exist");
	}

	// @ts-expect-error internal is private but still can be accessed after compiling
	if (task.finished == -1) {
		let controller: ReadableStreamDefaultController | undefined;
		const stream = new ReadableStream({
			start(control) {
				logIt.info('Connection established');
				controller = control;
				controller.enqueue(new TextEncoder().encode(': ping\n\n'));
				// @ts-expect-error internal is private but still can be accessed after compiling
				task.streams.add(controller);
			},

			cancel() {
				logIt.info('Connection closed');
				if (controller) {
					// @ts-expect-error internal is private but still can be accessed after compiling
					task.streams.delete(controller);
				}
			}
		});
		return new Response(stream, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				Connection: 'keep-alive'
			}
		});
	}

	logIt.error('task already concluded');
	throw error(402, 'task already concluded');
}
