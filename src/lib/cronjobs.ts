const filePath = 'src/lib/cronjobs.ts';

import { schedule } from 'node-cron';
import { stepTick } from '$lib/database/tables/settings';
import { channelList } from './downloader/channelList';
import { logDebug, logSetup } from './database/functions/logs';

export function initCronjob() {
	const ticker = schedule(`0 0 * * * *`, () => {
		logDebug('cron tick', '', filePath, 'initCronjob/ticker');
		if (stepTick())	channelList();
	});
	ticker.start();
	logSetup('Hourly Cronjob started', '', filePath, 'initCronjob');
}
