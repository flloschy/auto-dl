const filePath = 'src/lib/database/functions/channels.ts';

import { logInfo } from '$lib/database/functions/logs';
import { getWaitlist, remWaitlist } from '$lib/database/functions/waitlist';
import { download } from './download';

export async function waitList() {
	logInfo('running waitlist', '', filePath, 'waitList');

	for (const videoId of getWaitlist()) {
		await download(videoId);
		remWaitlist(videoId);
	}

	logInfo('running waitlist done', '', filePath, 'waitList');
}
