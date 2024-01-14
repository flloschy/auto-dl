import { getWaitlist } from '$lib/waitlist/access';
import { appendWaitlist } from '$lib/waitlist/append';
import type { Actions } from '@sveltejs/kit';

export async function load() {
	return { lines: getWaitlist() };
}

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const youtubeURL = data.get('url') as string;
		if (appendWaitlist(youtubeURL)) {
			return { success: true, t: Date.now() };
		}
		return { success: false, t: Date.now() };
	},
};
