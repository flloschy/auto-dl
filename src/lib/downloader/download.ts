const filePath = 'src/lib/downloader/download.ts';

import { getChannelByName } from '$lib/database/functions/channels';
import { logCritical, logDebug, logInfo, logWarning } from '$lib/database/functions/logs';
import { getSeasonFromTitle } from '$lib/database/functions/seasons';
import { getVideoNum, setVideo, videoExists } from '$lib/database/functions/videos';
import type { Video, YoutubeId } from '$lib/database/tables/videos';
import { execute, formatDuration, formatSize } from '$lib/helper';
import { webhook } from '$lib/settings';
import { statSync } from 'node:fs';

function sendWebhook(video: Video) {
	if (webhook.length == 0) return;

	fetch(webhook, {
		method: 'post',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			embeds: [
				{
					title: video.title,
					color: 3459607,
					fields: [
						{
							name: 'Season',
							value: video.season.name,
							inline: true
						},
						{
							name: 'Number',
							value: '`' + video.num + '`',
							inline: true
						},
						{
							name: '',
							value: '',
							inline: false
						},
						{
							name: 'Length',
							value: '`' + formatDuration(video.length) + '`',
							inline: true
						},
						{
							name: 'Size',
							value: '`' + formatSize(video.size) + '`',
							inline: true
						}
					],
					author: {
						name: video.channel.displayName
					},
					timestamp: video.time.toISOString()
				}
			]
		})
	});
}

export async function download(videoId: YoutubeId) {
	try {
		if (videoExists(videoId)) {
			logDebug('video exists', videoId, filePath, 'download');
			return;
		}
		logDebug('downloading video', videoId, filePath, 'download');

		const data = await (
			await fetch(
				`https://youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
			)
		).json();
		const channelName = data['author_name'] as string;

		const channel = getChannelByName(channelName);

		if (!channel) {
			logWarning("channel doesn't exist", `name: ${channelName}`, filePath, 'download');
			return;
		}

		const videoTitle = data['title'] as string;
		const season = getSeasonFromTitle(channel, videoTitle);

		const videoNum = getVideoNum(channel, season);
		const path = './data/downloads/' + channel.path + '/' + season.path;
		const file = `S${season.number.toString().padStart(2, '0')}E${videoNum.toString().padStart(2, '0')} [${videoId}]`;

		await execute(
			`yt-dlp -P "${path}" --output "${file}" --clean-info-json --no-progress --embed-chapters --embed-metadata --quiet --sponsorblock-mark all --sponsorblock-remove sponsor https://www.youtube.com/watch?v=${videoId}`
		);

		const length = parseFloat(
			await execute(
				`ffprobe -i "${path}/${file}.webm" -show_entries format=duration -v quiet -of csv="p=0"`
			)
		);

		const size = Math.round(statSync(`${path}/${file}.webm`).size / 1000);

		const video: Video = {
			num: videoNum,
			id: videoId,
			channel,
			season,
			length,
			size,
			time: new Date(),
			title: videoTitle,
			path: file + '.webm'
		};

		setVideo(video);
		sendWebhook(video);
		logInfo('downloaded Video', `id: ${video.id}; title: ${video.title}`, filePath, 'download');
	} catch {
		logCritical('failed to download video', videoId, filePath, 'download');
	}
}
