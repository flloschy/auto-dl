import { deleteChannel, editChannel, getChannel } from '$lib/database/functions/channels.js';
import { getSeasons } from '$lib/database/functions/seasons';
import { getVideoLength, getVideoNum, getVideoSize } from '$lib/database/functions/videos.js';
import { error, type Actions, redirect } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const channel = getChannel(params.channelId);
	if (!channel) throw error(404, 'Channel not found: ' + params.channelId);
	return {
		id: channel.id,
		name: channel.displayName,
		description: channel.description,
		downloading: channel.downloading,
		seasons: getSeasons(channel).map((season) => {
			return {
				name: season.name,
				id: season.id,
				length: getVideoLength(channel, season),
				videos: getVideoNum(channel, season),
				size: getVideoSize(channel, season)
			};
		})
	};
};

export const actions: Actions = {
	edit: async ({ request, params }) => {
		const data = await request.formData();
		const downloading = data.get('auto') == 'on';
		const description = data.get('description');
		const displayName = data.get('name');

		editChannel({
			id: params.channelId as string,
			downloading,
			// @ts-expect-error Typescript says these values cant be undefined, but the underlying code can handle this.
			description,
			// @ts-expect-error Typescript says these values cant be undefined, but the underlying code can handle this.
			displayName
		});
	},
	delete: async ({ params }) => {
		deleteChannel(params.channelId as string);
		throw redirect(301, '/channels');
	}
};
