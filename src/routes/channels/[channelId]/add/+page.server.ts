import { getChannel } from '$lib/database/functions/channels';
import { addSeason, countSeasons } from '$lib/database/functions/seasons';
import { error, type Actions } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const channel = getChannel(params.channelId);
	if (!channel) throw error(404, 'Channel not found: ' + params.channelId);
	return { id: channel.id };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const data = await request.formData();
		const name = data.get('name');
		const description = data.get('description');
		const regex = data.get('regex');

		if (!name) {
			return { text: 'Missing Name' };
		}
		if (!regex) {
			return { text: 'Missing regex' };
		}
		try {
			new RegExp(regex as string);
		} catch {
			return { text: 'Invalid Regex' };
		}
		if (!description) {
			return { text: 'Missing Description' };
		}
		const channel = getChannel(params.channelId as string);
		if (!channel) {
			return { text: 'Invalid Channel' };
		}

		return {
			text: addSeason(
				channel,
				countSeasons(channel),
				(name as string).trim(),
				description as string,
				regex as string
			)
		};
	}
};
