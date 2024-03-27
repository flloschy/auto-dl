import { countChannels } from '$lib/database/functions/channels';
import { countSeasons } from '$lib/database/functions/seasons';
import { countVideos } from '$lib/database/functions/videos';
import { countWaitlist } from '$lib/database/functions/waitlist';
import {
	autoValue,
	editAuto,
	editInterval,
	intervalValue,
	nextRun,
	resetInterval
} from '$lib/database/tables/settings';
import { channelList } from '$lib/downloader/channelList';
import { waitList } from '$lib/downloader/waitList';
import type { Actions } from '@sveltejs/kit';

export const load = async () => {
	return {
		channels: countChannels(),
		seasons: countSeasons(),
		videos: countVideos(),
		waitlist: countWaitlist(),
		interval: intervalValue,
		next: nextRun(),
		auto: autoValue,
		ip: await (await fetch('https://dynamicdns.park-your-domain.com/getip')).text()
	};
};

export const actions: Actions = {
	settings: async ({ request }) => {
		const data = await request.formData();
		const interval = data.get('interval');
		const auto = data.get('auto');

		if (typeof interval == 'string') {
			editInterval(parseInt(interval));
		}
		editAuto(auto == 'on');
	},
	channel: async () => {
		channelList();
		resetInterval();
	},
	waitlist: async () => {
		waitList();
	},
	reset: () => {
		resetInterval();
	}
};
