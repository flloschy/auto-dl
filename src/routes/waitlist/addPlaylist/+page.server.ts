import { addWaitlist } from '$lib/database/functions/waitlist';
import { execute } from '$lib/downloader/download';
import type { Actions } from '@sveltejs/kit';

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const link = data.get('link');
		if (!link) return;
		let output =
			await execute(
				`yt-dlp --flat-playlist --print id "${link}"`
			);
		let ids = output.split("\n");
		ids.forEach((id) => id ? addWaitlist(id.trim()) : null);
	}
};