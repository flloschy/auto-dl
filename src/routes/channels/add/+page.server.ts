import { addChannel } from '$lib/database/functions/channels';
import type { Actions } from '@sveltejs/kit';

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id');
		const name = data.get('name');
		const description = data.get('description');

		if (!id) {
			return { text: 'Missing ID' };
		}
		if (!name) {
			return { text: 'Missing Name' };
		}
		if (!description) {
			return { text: 'Missing Description' };
		}

		return { text: addChannel(id as string, name as string, description as string) };
	}
};
