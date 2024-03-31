import { getWaitlist, remWaitlist } from '$lib/database/functions/waitlist';
import type { Actions } from '@sveltejs/kit';

export const load = async () => {
	return {
		videos: getWaitlist()
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id');
		if (!id) return;
		remWaitlist(id as string);
	}
};
