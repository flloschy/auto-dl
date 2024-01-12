import { error, type Actions } from '@sveltejs/kit';
import { pushToast } from '../../toast.js';
import { getChannel } from '$lib/data/access.js';
import { addSeason } from '$lib/data/add.js';
import { deleteChannel } from '$lib/data/delete.js';
import { updateChannel } from '$lib/data/update.js';

export function load({ params }) {
	const channel = getChannel(params.channelid);
	if (!channel) throw error(404, 'Channel not found');
	return channel;
}

export const actions: Actions = {
	update: async ({ request, params }) => {
		const id = params.channelid as string;
		const data = await request.formData();
		updateChannel(
			id,
			data.get('name') as string,
			data.get('description') as string,
			data.get('auto') === 'on',
			data.get('audio') === 'on',
		);
	},
	delete: async ({ params }) => {
		const id = params.channelid as string;
		deleteChannel(id);
		pushToast('successfully deleted', false);
		throw error(404, 'Channel Deleted');
	},
	new: async ({ request, params }) => {
		const id = params.channelid as string;
		const data = await request.formData();
		const key = addSeason(
			id,
			data.get('name') as string,
			data.get('description') as string,
			data.get('regex') as string,
		);
		if (!key) throw error(404, 'Channel not found');
		return key;
	},
};
