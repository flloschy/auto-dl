import { deleteTask, fixNFO, replaceNFO, syncAll } from '$lib/tasks/tasks';

export const load = async ({ getClientAddress }) => {
	return {
		your: getClientAddress(),
		server: await (await fetch('https://dynamicdns.park-your-domain.com/getip')).text()
	};
};

export const actions = {
	// Actions
	fixNFO,

	// Tasks
	deleteTask,
	replaceNFO,
	syncAll
};
