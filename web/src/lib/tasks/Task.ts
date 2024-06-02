import type { TaskState } from '$lib/types';
import { writable } from 'svelte/store';

export class Task {
	status = writable<TaskState>({
		detail: '',
		process: 'system',
		progress: 0,
		id: '',
		state: 'running',
		title: 'Starting',
		finished: Infinity
	});
	private setup: (task: Task) => Promise<boolean>;
	private work: (task: Task) => Promise<void>;
	constructor(
		id: string,
		title: string,
		setup: (task: Task) => Promise<boolean>,
		work: (task: Task) => Promise<void>
	) {
		this.status.update((s) => ({
			...s,
			id,
			title
		}));
		this.setup = setup;
		this.work = work;
		this.run();
	}
	private async run() {
		if (await this.setup(this)) await this.work(this);
	}
}
