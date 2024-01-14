import { getChannel } from '$lib/data/access';
import { deleteEpisode, deleteSeason } from '$lib/data/delete';
import { updateSeason } from '$lib/data/update';
import { error, type Actions } from '@sveltejs/kit';

export function load({ params }) {
	const channel = getChannel(params.channelid);
	if (!channel) throw error(404, 'channel not found');
	const season = channel.seasons[params.seasonid];
	if (!season) throw error(404, 'season not found');

	return {
		channelid: params.channelid,
		seasonid: season.seasonId,
		deletable: season.deletable,
		description: season.description,
		name: season.name,
		regex: season.regex,
		updated: season.updated,
		episodes: season.episodes,
	};
}

export const actions: Actions = {
	delete: async ({ params }) => {
		const channelid = params.channelid as string;
		const seasonkey = params.seasonid as string;
		if (!deleteSeason(channelid, seasonkey)) {
			throw error(401, 'Season not deletable');
		}
	},
	remove: async ({ params, request }) => {
		const channelid = params.channelid as string;
		const seasonkey = params.seasonid as string;
		const data = await request.formData();

		deleteEpisode(channelid, seasonkey, parseInt(data.get('id') as string));
	},
	update: async ({ request, params }) => {
		const channelid = params.channelid as string;
		const seasonkey = params.seasonid as string;
		const data = await request.formData();
		if (
			!updateSeason(
				channelid,
				seasonkey,
				data.get('name') as string,
				data.get('description') as string,
				data.get('regex') as string,
			)
		) {
			throw error(401, 'Channel or Season does not exist');
		}
	},
};
