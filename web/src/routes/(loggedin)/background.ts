import { browser } from '$app/environment';
import type { Broadcast_able, Tasks } from '$lib/types';
import { toaster } from '$lib/ui/toast/toaster';
import { writable } from 'svelte/store';

export const taskStore = writable<Tasks>({});

async function load() {
	const response = await fetch('/api/tasks');
	const tasks = JSON.parse(await response.text()) as Tasks;
	taskStore.update(() => tasks);

	const EventStream = new EventSource('/api/stream');
	EventStream.onmessage = async (event: MessageEvent) => {
		const { taskUpdate, toastUpdate, removeTask } = JSON.parse(event.data) as Broadcast_able;
		if (taskUpdate) {
			taskStore.update((s) => {
				s[taskUpdate.id] = taskUpdate;
				return s;
			});
		}
		if (removeTask) {
			taskStore.update((t) => {
				delete t[removeTask];
				return t;
			});
		}
		if (toastUpdate) {
			if (toastUpdate.id) {
				if (
					!toaster.resolve(
						toastUpdate.id,
						toastUpdate.type,
						toastUpdate.title,
						toastUpdate.description
					)
				)
					toaster[toastUpdate.type](toastUpdate.title, toastUpdate.description);
			} else {
				toaster[toastUpdate.type](toastUpdate.title, toastUpdate.description);
			}
		}
	};
}

if (browser) load();
