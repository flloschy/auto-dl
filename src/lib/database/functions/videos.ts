const filePath = 'src/lib/database/functions/videos.ts';

import { overlapObjects } from '$lib/helper';
import fs from 'node:fs';
import type { Channel } from '../tables/channels';
import { seasons, type Season } from '../tables/seasons';
import { videos, type Video } from '../tables/videos';
import { getSeason } from './seasons';
import { logCritical, logInfo } from './logs';

export function videoExists(videoId: string) {
	return videos.keyArray().includes(videoId);
}

export function getVideoNum(channel?: Channel, season?: Season) {
	if (!season && channel) {
		return videos.filter((v) => v.channel.id == channel.id).count;
	}
	if (season) {
		return videos.filter((v) => v.season.id == season.id).count;
	}
	return 0;
}
export function getVideoSize(channel: Channel, season?: Season) {
	if (!season) {
		return videos
			.filter((v) => v.channel.id == channel.id)
			.map((v) => v.size)
			.reduce((p, c) => p + c, 0);
	}
	return videos
		.filter((v) => v.channel.id == channel.id && v.season.id == season.id)
		.map((v) => v.size)
		.reduce((p, c) => p + c, 0);
}
export function getVideoLength(channel: Channel, season?: Season) {
	if (!season) {
		return videos
			.filter((v) => v.channel.id == channel.id)
			.map((v) => v.length)
			.reduce((p, c) => p + c, 0);
	}
	return videos
		.filter((v) => v.channel.id == channel.id && v.season.id == season.id)
		.map((v) => v.length)
		.reduce((p, c) => p + c, 0);
}

export function setVideo(video: Video) {
	videos.set(video.id, video);
}
export function countVideos() {
	return videos.size;
}

export function getVideos(season: Season) {
	return videos.filter((v) => v.season.id == season.id);
}
export function getVideo(videoId: string) {
	return videos.get(videoId);
}
export function editVideo(data: { id: string } & Partial<Video>) {
	const video = getVideo(data.id);
	if (!video) return;
	const newVideo = overlapObjects(video, data);
	videos.set(video.id, newVideo);

	logInfo(
		'video edit',
		`old: ${JSON.stringify(video)};; new: ${JSON.stringify(newVideo)}`,
		filePath,
		'editVideo'
	);
}
export function moveVideo(videoId: string, target: string) {
	const video = getVideo(videoId);
	if (!video) {
		console.log('vid', video, videoId);
		return;
	}
	if (video.season.id == target) return;
	const newSeason = getSeason(target);
	if (!newSeason) {
		console.log('sea', newSeason, target, seasons.keyArray());
		return;
	}

	const videoNum = getVideoNum(undefined, newSeason);
	const newPath = `S${newSeason.number.toString().padStart(2, '0')}E${videoNum.toString().padStart(2, '0')} ${video.path.split(' ')[1]}`;

	try {
		fs.renameSync(
			`./data/downloads/${video.channel.path}/${video.season.path}/${video.path}`,
			`./data/downloads/${video.channel.path}/${newSeason.path}/${newPath}`
		);
	} catch (err) {
		console.error(err);
		logCritical(
			`failed to move Dir`,
			`./data/downloads/${video.channel.path}/${video.season.path}/${video.path} -> ./data/downloads/${video.channel.path}/${newSeason.path}/${newPath}`,
			filePath,
			'moveVideo'
		);
		return;
	}

	const followUpVideos = getVideos(video.season)
		.filterArray((v) => v.num > video.num)
		.sort((a, b) => b.num - a.num);

	for (const v of followUpVideos) {
		try {
			const n = `S${v.season.number.toString().padStart(2, '0')}E${(v.num - 1).toString().padStart(2, '0')} ${v.path.split(' ')[1]}`;
			fs.renameSync(
				`./data/downloads/${video.channel.path}/${video.season.path}/${v.path}`,
				`./data/downloads/${video.channel.path}/${video.season.path}/${n}`
			);
			v.num -= 1;
			v.path = n;
			editVideo(v);
		} catch {
			logCritical(
				'failed to move DIr',
				`./data/downloads/${video.channel.path}/${video.season.path}/${v.path} -> ./data/downloads/${video.channel.path}/${video.season.path}/${v.season.number.toString().padStart(2, '0')}E${(v.num - 1).toString().padStart(2, '0')} ${v.path.split(' ')[1]}`,
				filePath,
				'moveVideo'
			);
		}
	}

	video.num = videoNum;
	video.path = newPath;
	video.season = newSeason;
	videos.set(video.id, video);

	logInfo(
		'moved video',
		`./data/downloads/${video.channel.path}/${video.season.path}/${video.path} -> ./data/downloads/${video.channel.path}/${newSeason.path}/S${newSeason.number.toString().padStart(2, '0')}E${getVideoNum(undefined, newSeason).toString().padStart(2, '0')} ${video.path.split(' ')[1]}`,
		filePath,
		'moveVideo'
	);
}

export function deleteVideo(videoId: string) {
	const video = getVideo(videoId);
	if (!video) return;

	try {
		fs.rmSync(`./data/downloads/${video.channel.path}/${video.season.path}/${video.path}`);
	} catch {
		logCritical(
			`failed to delete Dir`,
			`./data/downloads/${video.channel.path}/${video.season.path}/${video.path}`,
			filePath,
			'deleteVideo'
		);
	}

	const followUpVideos = getVideos(video.season)
		.filterArray((v) => v.num > video.num)
		.sort((a, b) => b.num - a.num);

	for (const v of followUpVideos) {
		try {
			const n = `S${v.season.number.toString().padStart(2, '0')}E${(v.num - 1).toString().padStart(2, '0')} ${v.path.split(' ')[1]}`;
			fs.renameSync(
				`./data/downloads/${video.channel.path}/${video.season.path}/${v.path}`,
				`./data/downloads/${video.channel.path}/${video.season.path}/${n}`
			);
			v.num -= 1;
			v.path = n;
			editVideo(v);
		} catch {
			logCritical(
				'failed to move DIr',
				`./data/downloads/${video.channel.path}/${video.season.path}/${v.path} -> ./data/downloads/${video.channel.path}/${video.season.path}/${v.season.number.toString().padStart(2, '0')}E${(v.num - 1).toString().padStart(2, '0')} ${v.path.split(' ')[1]}`,
				filePath,
				'moveVideo'
			);
		}
	}
	videos.delete(video.id);

	logInfo('delete video', `id: ${video.id}; title: ${video.title}`, filePath, 'deleteVideo');
}
