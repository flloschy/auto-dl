import { getChannels } from '$lib/database/functions/channels';
import { countSeasons } from '$lib/database/functions/seasons';
import { getVideoLength, getVideoNum, getVideoSize } from '$lib/database/functions/videos';

export const load = async () => {
	return {
		data: getChannels().map((channel) => ({
			name: channel.displayName,
			id: channel.id,
			seasons: countSeasons(channel),
			videos: getVideoNum(channel),
			size: getVideoSize(channel),
			length: getVideoLength(channel)
		}))
	};
};
