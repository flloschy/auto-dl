import { writable } from 'svelte/store';

export interface Toast {
	message: string;
	id: number;
	error: boolean | null;
}

export const toast = writable<Toast[]>([]);

let id: number = 0;
export const pushToast = (message: string, error: boolean | null = null) => {
	toast.update((toasts) => {
		toasts.push({ message, id: id++, error });
		return toasts;
	});
	return id - 1;
};

export const removeToast = (id: number) => {
	toast.update((toasts) => {
		const n: Toast[] = [];
		toasts.forEach((v) => {
			if (v.id !== id) {
				n.push(v);
			}
		});
		return n;
	});
};
