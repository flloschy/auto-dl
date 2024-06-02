import { broadcast } from '$lib/broadcaster';
import type { Tasks } from '$lib/types';
import { Task } from './Task';

let id = 0;
export const states: Tasks = {};

export function pushTask(
	title: string,
	setup: (task: Task) => Promise<boolean>,
	work: (task: Task) => Promise<void>
) {
	new Task((id++).toString(), title, setup, work).status.subscribe((s) => {
		if (states[s.id]?.state != s.state && s.state != 'running') {
			broadcast({
				toastUpdate: {
					type: s.state == 'error' ? 'error' : 'success',
					title: s.title,
					description: s.detail,
					id: s.toastId
				}
			});

			Object.entries(states)
				.filter((task) => task[1].state == s.state)
				.sort((task1, task2) => task2[1].finished - task1[1].finished)
				.forEach((task, index) => {
					if (index >= 9) removeTask(task[0]);
				});
		}
		states[s.id] = s;
		broadcast({ taskUpdate: s });
	});
}

export function removeTask(key: string) {
	if (states[key].state != 'running') {
		broadcast({
			removeTask: key
		});
		delete states[key];
		return true;
	}
	return false;
}
