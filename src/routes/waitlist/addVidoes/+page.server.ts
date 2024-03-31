import { addWaitlist } from '$lib/database/functions/waitlist';
import type { Actions } from '@sveltejs/kit';

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id');
		if (!id) return;
		addWaitlist((id as string).trim());
	}
};
