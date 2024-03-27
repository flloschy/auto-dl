const filePath = 'src/lib/downloader/download.ts';

import { getChannelByName } from '$lib/database/functions/channels';
import { logDebug, logInfo, logWarning } from '$lib/database/functions/logs';
import { getSeasonFromTitle } from '$lib/database/functions/seasons';
import { getVideoNum, setVideo, videoExists } from '$lib/database/functions/videos';
import type { Video, YoutubeId } from '$lib/database/tables/videos';
import { exec } from 'child_process';
import { statSync } from 'node:fs';

const execute = async (command: string) =>
	await new Promise<string>((resolve) => {
		let out = '';
		exec(command, (_, stdout) => {
			out = stdout;
		})
			.on('error', (err) => console.error(err))
			.on('exit', () => setTimeout(() => resolve(out), 500));
	});

export async function download(videoId: YoutubeId) {
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

	logInfo('downloaded Video', `id: ${video.id}; title: ${video.title}`, filePath, 'download');
}
