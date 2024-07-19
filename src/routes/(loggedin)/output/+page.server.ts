import { runningTasks } from '$lib/commandManager/commandLib/Execution';
import { error } from '@sveltejs/kit';
import Logger from '$lib/logger/index.js';
const logIt = Logger.getLogger('output');

export const load = async ({ url }) => {
	const id = url.searchParams.get('id');
	if (!id) {
		logIt.error('Id not given');
		throw error(402, 'Id not given');
	}

	const exists = Object.keys(runningTasks).includes(id);
	if (!exists) {
		logIt.error("task doesn't exist");
		throw error(404, "task doesn't exist");
	}

	const task = runningTasks[id];
	if (!task) {
		logIt.error("task doesn't exist");
		throw error(404, "task doesn't exist");
	}

	logIt.debug('Showing logs for ' + id);
	// @ts-expect-error internal values are private but still can be accessed after compiling
	return { logs: task.logs, id, finished: task.finished };
};
