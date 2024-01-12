import { addChannel } from '$lib/data/add';
import { error, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		if (
			!addChannel(
				data.get('id') as string,
				data.get('name') as string,
				data.get('description') as string,
				(data.get('auto') as string) == 'on',
				(data.get('audio') as string) == 'on',
			)
		) {
			throw error(400, 'Channel already exists');
		}
		return data.get('id') as string;
	},
};
