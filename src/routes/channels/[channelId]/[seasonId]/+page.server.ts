import { getChannel } from '$lib/database/functions/channels.js';
import { deleteSeason, editSeason, getSeason } from '$lib/database/functions/seasons.js';
import { getVideos } from '$lib/database/functions/videos.js';
import { error, redirect } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const channel = getChannel(params.channelId as string);
	if (!channel) throw error(404, 'Channel not found: ' + params.channelId);

	const season = getSeason(params.seasonId as string);
	if (!season) throw error(404, 'Season not found: ' + params.seasonId);

	return {
		id: params.channelId as string,
		season: { id: params.seasonId as string },
		regex: season.regex,
		name: season.name,
		description: season.description,
		num: season.number,
		videos: getVideos(season).map((v) => ({
			size: v.size,
			length: v.length,
			title: v.title,
			id: v.id
		}))
	};
};

export const actions = {
	edit: async ({ params, request }) => {
		const channel = getChannel(params.channelId as string);
		if (!channel) throw error(404, 'Channel not found: ' + params.channelId);

		const season = getSeason(params.seasonId as string);
		if (!season) throw error(404, 'Season not found: ' + params.seasonId);

		const data = await request.formData();
		const name = data.get('name');
		const description = data.get('description');
		let regex = data.get('regex');

		try {
			new RegExp(regex as string);
		} catch {
			regex = null;
		}

		editSeason({
			id: params.seasonId as string,
			// @ts-expect-error Typescript says these values cant be undefined, but the underlying code can handle this.
			name,
			// @ts-expect-error Typescript says these values cant be undefined, but the underlying code can handle this.
			regex,
			// @ts-expect-error Typescript says these values cant be undefined, but the underlying code can handle this.
			description
		});
	},
	delete: async ({ params }) => {
		deleteSeason(params.seasonId);
		throw redirect(301, `/channels/${params.channelId}`);
	}
};
