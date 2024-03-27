import { channels } from '$lib/database/tables/channels';
import { seasons } from '$lib/database/tables/seasons';
import { settings } from '$lib/database/tables/settings';
import { videos } from '$lib/database/tables/videos';
import { waitlist } from '$lib/database/tables/waitlist';
import type { Actions } from '@sveltejs/kit';

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const overwrite = data.get('overwrite') as string;
		const json = JSON.parse(overwrite);

		settings.deleteAll();
		// @ts-expect-error ts doesn't know that this works
		Object.entries(json['settings']).forEach(([key, value]) => settings.set(key, value));

		channels.deleteAll();
		// @ts-expect-error ts doesn't know that this works
		Object.entries(json['channels']).forEach(([key, value]) => channels.set(key, value));

		seasons.deleteAll();
		// @ts-expect-error ts doesn't know that this works
		Object.entries(json['seasons']).forEach(([key, value]) => seasons.set(key, value));

		videos.deleteAll();
		Object.entries(json['videos']).forEach(([key, value]) => {
			// @ts-expect-error ts doesn't know that this works
			value.time = new Date(value.time);
			// @ts-expect-error ts doesn't know that this works
			videos.set(key, value);
		});

		waitlist.deleteAll();
		// @ts-expect-error ts doesn't know that this works
		json['waitlist'].forEach((video) => waitlist.set(video, video));
	}
};
