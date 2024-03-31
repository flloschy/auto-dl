import { getChannel } from '$lib/database/functions/channels';
import { getSeasons } from '$lib/database/functions/seasons.js';
import { deleteVideo, editVideo, getVideo, moveVideo } from '$lib/database/functions/videos.js';
import { error, type Actions, redirect } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const video = getVideo(params.videoId as string);
	if (!video) throw error(404, 'Video not found: ' + params.videoId);

	const channel = getChannel(params.channelId as string);
	if (!channel) throw error(404, 'Channel not found: ' + params.channelId);

	const seasons = getSeasons(channel);

	return {
		video,
		channel,
		seasons
	};
};

export const actions: Actions = {
	rename: async ({ params, request }) => {
		const data = await request.formData();
		editVideo({ id: params.videoId as string, title: data.get('title') as string });
	},
	transfer: async ({ params, request }) => {
		const data = await request.formData();
		const target = data.get('target');
		moveVideo(params.videoId as string, target as string);
	},
	delete: async ({ params }) => {
		deleteVideo(params.videoId as string);
		throw redirect(301, `/channels/${params.channelId}/${params.seasonId}`);
	}
};
