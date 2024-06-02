import { writable } from 'svelte/store';

let toasted = 0;
interface Toast {
	id: string;
	type: 'success' | 'error' | 'info' | 'loading';
	message: string;
	detail?: string;
	remove?: true;
}

export const toastStore = writable<Toast[]>([]);
toastStore.subscribe((u) => {
	return u.every((t) => t.remove) ? [] : u;
});

const addToast = (pushToast: Toast) => {
	toastStore.update((toasts) => {
		toasts.push(pushToast);
		if (pushToast.type != 'loading') {
			setTimeout(() => toaster.remove(pushToast.id), 5000);
		}
		return toasts;
	});
};

export const toaster = {
	success: (message: string, detail: string | undefined = undefined) =>
		addToast({
			id: (toasted++).toString(),
			message,
			detail,
			type: 'success'
		}),
	error: (message: string, detail: string | undefined = undefined) =>
		addToast({
			id: (toasted++).toString(),
			message,
			detail,
			type: 'error'
		}),
	info: (message: string, detail: string | undefined = undefined) =>
		addToast({
			id: (toasted++).toString(),
			message,
			detail,
			type: 'info'
		}),
	loading: (
		message: string,
		detail: string | undefined = undefined,
		maxTimeout: number | undefined = undefined
	) => {
		const id = (toasted++).toString();
		addToast({
			id,
			message,
			detail,
			type: 'loading'
		});
		if (maxTimeout)
			setTimeout(() => {
				toastStore.update((toasts) =>
					toasts.map((toast) => {
						if (toast.id == id) {
							if (toast.type == 'loading')
								toaster.resolve(
									id,
									'error',
									'Timeout',
									'Request took longer than ' + Math.round(maxTimeout / 60) + 's'
								);
						}
						return toast;
					})
				);
			}, maxTimeout);
		return id;
	},
	resolve: (
		id: string,
		type: 'success' | 'error' | 'info',
		message: string,
		detail: string | undefined = undefined
	) => {
		let updated = false;
		toastStore.update((toasts) => {
			return toasts.map((toast) => {
				if (toast.id == id) {
					updated = true;
					toast.type = type;
					toast.message = message;
					toast.detail = detail;
					setTimeout(() => toaster.remove(id), 5000);
				}
				return toast;
			});
		});
		return updated;
	},
	remove: (id: string) => {
		toastStore.update(
			(toasts) =>
				toasts.map((t) => {
					if (t.id == id) {
						t.remove = true;
						// setTimeout(() => toastStore.update(tst => tst.filter(tt => tt.id != id)), 2000)
					}
					return t;
				})
			// toasts.filter(t => t.id != id)
		);
	}
};
