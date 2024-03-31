const filePath = 'src/lib/downloader/channelList.ts';

import { getChannels } from '$lib/database/functions/channels';
import { logDebug, logInfo } from '$lib/database/functions/logs';
import { download } from './download';

export async function channelList() {
	logInfo('running Channellist', '', filePath, 'channelList');

	const channels = getChannels();

	for (const channel of channels) {
		if (!channel.downloading) {
			logDebug(
				'skipped channel (downloading off)',
				`id: ${channel.id}; name:${channel.displayName}`,
				filePath,
				'channelList'
			);
			return;
		}
		const url = `https://decapi.me/youtube/latest_video?id=${channel.id}&format={id}&no_shorts=1&no_livestream=1`;
		const videoId = await (await fetch(url)).text();
		await download(videoId);
	}

	logInfo('running Channellist done', '', filePath, 'channelList');
}
