const filePath = 'src/lib/database/functions/seasons.ts';

import { overlapObjects } from '$lib/helper';
import fs from 'node:fs';
import type { Channel } from '../tables/channels';
import { seasons, type Season } from '../tables/seasons';
import { getVideos } from './videos';
import { logCritical, logInfo } from './logs';

export function getSeason(seasonId: string) {
	return seasons.get(seasonId);
}

export function getSeasonFromTitle(channel: Channel, title: string) {
	const matches = seasons
		.filter((season) => season.channel.id == channel.id)
		.filter((season) => !!title.match(new RegExp(season.regex)))
		.array()
		.sort((a, b) => b.number - a.number);
	const match = matches.at(0);
	return (
		match ??
		(seasons.find((season) => season.channel.id == channel.id && season.number == 0) as Season)
	);
}

export function countSeasons(channel?: Channel) {
	if (!channel) {
		return seasons.size;
	}
	return seasons.filter((season) => season.channel.id == channel.id).size;
}

export function getSeasons(channel: Channel) {
	return seasons.filter((season) => season.channel.id == channel.id).array();
}

export function addSeason(
	channel: Channel,
	number: number = 0,
	name: string = 'unsorted',
	description: string = 'The default place where every video ends up',
	regex: string = '.*'
) {
	const keys = seasons.keyArray();
	let id;
	do {
		id = channel.id + (number + Math.floor(100000 * Math.random()));
	} while (keys.includes(id));
	const path = 'Season ' + number.toString().padStart(2, '0');

	try {
		fs.mkdirSync(`./data/downloads/${channel.path}/${path}`);
	} catch {
		logCritical(
			'failed to create Dir',
			`./data/downloads/${channel.path}/${path}`,
			filePath,
			'addSeason'
		);
		return;
	}

	seasons.set(id, {
		id,
		channel,
		number,
		name,
		description,
		regex,
		path
	});

	logInfo(
		'created season',
		`channel: ${channel.displayName}; name: ${name}`,
		filePath,
		'addSeason'
	);
	return 'season created';
}
export function editSeason(
	data: {
		id: string;
	} & Partial<Season>
) {
	const season = getSeason(data.id);

	if (!season) return;

	const newSeason = overlapObjects(season, data);

	seasons.set(data.id, newSeason);
	logInfo(
		'season edit',
		`old: ${JSON.stringify(season)};; new: ${JSON.stringify(newSeason)}`,
		filePath,
		'editSeason'
	);
}

export async function deleteSeason(seasonId: string) {
	const { videos } = await import('../tables/videos');
	const season = getSeason(seasonId);
	if (!season) return;

	if (season.number == 0) return;
	try {
		fs.rmSync(`./data/downloads/${season.channel.path}/${season.path}/`, { recursive: true });
	} catch {
		logCritical(
			'failed to delete folder',
			`./data/downloads/${season.channel.path}/${season.path}/`,
			filePath,
			'deleteSeason'
		);
		return;
	}
	getVideos(season)
		.keyArray()
		.forEach((id) => videos.delete(id));
	seasons.delete(seasonId);
	logInfo('deleted channel', `id: ${season.id}; name: ${season.name}`, filePath, 'deleteSeason');
}
