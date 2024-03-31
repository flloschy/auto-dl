const filePath = 'src/lib/database/functions/channels.ts';

import { overlapObjects } from '$lib/helper';
import { channels, type Channel } from '../tables/channels';
import { seasons } from '../tables/seasons';
import { videos } from '../tables/videos';
import { logCritical, logInfo } from './logs';
import { addSeason, getSeasons } from './seasons';
import fs from 'fs';

export function getChannel(channelId: string) {
	return channels.get(channelId);
}
export function getChannels() {
	return channels.array();
}
export function countChannels() {
	return channels.size;
}
export function getChannelByName(channelName: string) {
	return channels.find((c) => c.displayName == channelName);
}
export function addChannel(id: string, name: string, description: string) {
	if (channels.keyArray().includes(id)) return 'Channel ID exists already';
	if (channels.find((channel) => channel.displayName == name)) return 'Channel Name already exists';
	const path = name.trim().replaceAll('/', '').replaceAll(' ', '-');
	try {
		fs.mkdirSync('./data/downloads/' + path);
	} catch {
		logCritical('failed to create Dir', './data/downloads/' + path, filePath, 'addChannel');
		return;
	}
	const channel = channels
		.set(id, {
			id,
			displayName: name,
			description,
			path,
			downloading: false
		})
		.get(id) as Channel;

	addSeason(channel);

	logInfo('channel created', `id: ${id}; name: ${name}`, filePath, 'addChannel');

	return 'Channel created';
}

export function editChannel(data: { id: string } & Partial<Channel>) {
	const channel = getChannel(data.id);

	if (!channel) return;

	const newChannel = overlapObjects(channel, data);

	if (channel.displayName != newChannel.displayName) {
		// @ts-expect-error when the displayName gets updated, it must exist
		newChannel.path = data.displayName.trim().replaceAll('/', '').replaceAll(' ', '-');
		try {
			fs.renameSync('./data/downloads/' + channel.path, './data/downloads/' + newChannel.path);
		} catch {
			logCritical(
				'failed to move Dir',
				'./data/downloads/' + channel.path + ' -> ./data/downloads/' + newChannel.path,
				filePath,
				'editChannel'
			);
			return;
		}
	}

	channels.set(data.id, newChannel);

	logInfo(
		'channel edit',
		`old: ${JSON.stringify(channel)};; new: ${JSON.stringify(newChannel)}`,
		filePath,
		'editChannel'
	);
}

export function deleteChannel(channelId: string) {
	const channel = getChannel(channelId);
	if (!channel) return;

	try {
		fs.rmSync(`./data/downloads/${channel.path}`, { recursive: true });
	} catch {
		logCritical(
			'failed to delete folder',
			`./data/downloads/${channel.path}`,
			filePath,
			'deleteChannel'
		);
		return;
	}

	videos
		.filter((v) => v.channel.id == channel.id)
		.keyArray()
		.forEach((v) => videos.delete(v));
	getSeasons(channel).forEach((s) => seasons.delete(s.id));
	channels.delete(channel.id);

	logInfo(
		'deleted channel',
		`id: ${channel.id}; name: ${channel.displayName}`,
		filePath,
		'deleteChannel'
	);
}
