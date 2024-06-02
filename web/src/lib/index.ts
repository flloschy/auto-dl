/* eslint-disable @typescript-eslint/no-explicit-any */
// place files you want to import through the `$lib` alias in this folder.
import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import {
	defaultAlbum,
	defaultEpisode,
	defaultPodcast,
	defaultPodcastEpisode,
	defaultSeason,
	defaultShow,
	type AlbumNFO,
	type EpisodeNFO,
	type PodcastEpisodeNFO,
	type PodcastNFO,
	type SeasonNFO,
	type ShowNFO
} from './types';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { scryptSync } from 'node:crypto';

type types = 'show' | 'season' | 'episode' | 'album' | 'podcast' | 'podcastEpisode';
type returnValue<T extends types> = T extends 'show'
	? ShowNFO
	: T extends 'season'
		? SeasonNFO
		: T extends 'episode'
			? EpisodeNFO
			: T extends 'album'
				? AlbumNFO
				: T extends 'podcast'
					? PodcastNFO
					: PodcastEpisodeNFO;
export function getMetadata<T extends types, R extends returnValue<T>>(
	type: T,
	show: string,
	season?: T extends 'season' | 'episode' | 'podcastEpisode' ? string : undefined,
	episode?: T extends 'episode' ? string : undefined
): R {
	if (type == 'show') {
		const stats = statSync(`../storage/video/${show}`);
		let nfoData = defaultShow(show, stats.birthtimeMs);
		try {
			const fileData = readFileSync(`../storage/video/${show}/tvshow.nfo`);
			nfoData = { ...nfoData, ...(new XMLParser().parse(fileData).tvshow as ShowNFO) };
			nfoData.trailer = nfoData.trailer.split('&videoid=').at(-1) || '';
		} catch {
			/*empty*/
		}

		return nfoData as R;
	} else if (type == 'season') {
		const stats = statSync(`../storage/video/${show}/${season}`);
		const seasons = readdirSync(`../storage/video/${show}/`, { withFileTypes: true });
		const length = seasons.filter((s) => s.isDirectory()).length;
		const index = seasons.map((s, i) => ({ ...s, i })).find((v) => v.name == (season as string))?.i;
		let nfoData = defaultSeason(season as string, stats.birthtimeMs, (index ?? length).toString());
		try {
			const fileData = readFileSync(`../storage/video/${show}/${season}/season.nfo`);
			// nfoData = overwriteObject<SeasonNFO>(nfoData, new XMLParser().parse(fileData).season as SeasonNFO)
			nfoData = { ...nfoData, ...(new XMLParser().parse(fileData).season as SeasonNFO) };
			nfoData.trailer = nfoData.trailer.split('&videoid=').at(-1) || '';
		} catch {
			/*empty*/
		}
		return nfoData as R;
	} else if (type == 'episode') {
		const stats = statSync(`../storage/video/${show}/${season}/${episode}`);
		const episodes = readdirSync(`../storage/video/${show}/${season}`, {
			withFileTypes: true
		}).filter((e) => e.isFile() && !e.name.endsWith('nfo') && !e.name.endsWith('part'));
		const length = episodes.length + 1;
		const index =
			(episodes.map((e, i) => ({ ...e, i })).find((e) => e.name == (episode as string))?.i || 0) +
			1;
		let nfoData = defaultEpisode(
			episode as string,
			stats.birthtimeMs,
			(index ?? length).toString()
		);
		try {
			const splittedFile = (episode as string).split('.');
			splittedFile.pop();
			const fileName = splittedFile.join('.');
			const fileData = readFileSync(`../storage/video/${show}/${season}/${fileName}.nfo`);
			nfoData = { ...nfoData, ...(new XMLParser().parse(fileData).episodedetails as EpisodeNFO) };
			nfoData.trailer = nfoData.trailer.split('&videoid=').at(-1) || '';
		} catch {
			/*empty*/
		}

		if (nfoData.youtubemetadataid == '') {
			if (episode?.match(/\[([^)]+)\]/)) {
				nfoData.youtubemetadataid = episode.match(/\[([^)]+)\]/)?.at(1) as string;
			}
		}

		return nfoData as R;
	} else if (type == 'album') {
		const stats = statSync(`../storage/music/${show}/`);
		let nfoData = defaultAlbum(show, stats.birthtimeMs);
		try {
			const fileData = readFileSync(`../storage/music/${show}/album.nfo`);
			nfoData = { ...nfoData, ...(new XMLParser().parse(fileData).album as AlbumNFO) };
		} catch {
			/* empty */
		}

		return nfoData as R;
	} else if (type == 'podcast') {
		const stats = statSync(`../storage/podcast/${show}/`);
		let nfoData = defaultPodcast(show, stats.birthtimeMs);
		try {
			const fileData = readFileSync(`../storage/podcast/${show}/album.nfo`);
			nfoData = { ...nfoData, ...(new XMLParser().parse(fileData).album as AlbumNFO) };
		} catch {
			/* empty */
		}

		return nfoData as R;
	} /*if (type == "podcastEpisode")*/ else {
		const stats = statSync(`../storage/podcast/${show}/${season}`);
		const episodes = readdirSync(`../storage/podcast/${show}/`, {
			withFileTypes: true
		}).filter((e) => e.isFile() && !e.name.endsWith('nfo') && !e.name.endsWith('part'));
		const length = episodes.length;
		const index = episodes
			.map((e, i) => ({ ...e, i }))
			.find((e) => e.name == (season as string))?.i;
		let nfoData = defaultPodcastEpisode(
			season as string,
			stats.birthtimeMs,
			((index ?? length) + 1).toString()
		);
		try {
			const splittedFile = (season as string).split('.');
			splittedFile.pop();
			const fileName = splittedFile.join('.');
			const fileData = readFileSync(`../storage/podcast/${show}/${fileName}.nfo`);
			nfoData = {
				...nfoData,
				...(new XMLParser().parse(fileData).episodedetails as PodcastEpisodeNFO)
			};
		} catch {
			/*empty*/
		}

		return nfoData as R;
	}
}
export function writeMetadata<T extends types>(
	type: T,
	overwrite: Partial<returnValue<T>>,
	show: string,
	season?: T extends 'season' | 'episode' | 'podcastEpisode' ? string : undefined,
	episode?: T extends 'episode' ? string : undefined
): {
	error?: {
		title: string;
		details: string;
	};
	success?: {
		title: string;
		details: string;
	};
} {
	let nfoObject;
	let savePath = `../storage/video/${show}/`;
	if (type == 'show') {
		nfoObject = { tvshow: { ...getMetadata('show', show), ...overwrite } };
		if (nfoObject.tvshow.trailer) {
			nfoObject.tvshow.trailer =
				'plugin://plugin.video.youtube/?action=play_video&videoid=' + nfoObject.tvshow.trailer;
		}
		savePath += 'tvshow.nfo';
	} else if (type == 'season') {
		nfoObject = { season: { ...getMetadata('season', show, season), ...overwrite } };
		if (nfoObject.season.trailer) {
			nfoObject.season.trailer =
				'plugin://plugin.video.youtube/?action=play_video&videoid=' + nfoObject.season.trailer;
		}
		savePath += `${season}/season.nfo`;
	} else if (type == 'episode') {
		nfoObject = {
			episodedetails: { ...getMetadata('episode', show, season, episode), ...overwrite }
		};
		if (nfoObject.episodedetails.trailer) {
			nfoObject.episodedetails.trailer =
				'plugin://plugin.video.youtube/?action=play_video&videoid=' +
				nfoObject.episodedetails.trailer;
		}
		const splittedFilename = (episode as string).split('.');
		splittedFilename.pop();
		const fileName = splittedFilename.join();
		savePath += `${season}/${fileName}.nfo`;
	} else if (type == 'album') {
		nfoObject = {
			album: { ...getMetadata('album', show), ...overwrite }
		};
		savePath = `../storage/album/${show}/album.nfo`;
	} else if (type == 'podcast') {
		nfoObject = {
			album: { ...getMetadata('podcast', show), ...overwrite }
		};
		savePath = `../storage/podcast/${show}/album.nfo`;
	} /*if (type == "podcastEpisode")*/ else {
		nfoObject = {
			episodedetails: { ...getMetadata('podcastEpisode', show, season), ...overwrite }
		};
		const splittedFilename = (season as string).split('.');
		splittedFilename.pop();
		const fileName = splittedFilename.join();
		savePath = `../storage/podcast/${show}/${fileName}.nfo`;
	}

	const xmlString = new XMLBuilder({
		format: true
	}).build(nfoObject);

	const data = `<?xml version="1.0" encoding="utf-8" standalone="yes"?>\n${xmlString.replaceAll('&amp;', '&')}`;

	try {
		writeFileSync(savePath, data);
	} catch (e) {
		return {
			error: {
				title: 'Saving Metadata Failed',
				details: (e as { message: string }).message
			}
		};
	}

	return {
		success: {
			title: 'Metadata Updated',
			details: ''
		}
	};
}

export function countSeasonsAndEpisodes(path: string) {
	const entires = readdirSync(`../storage/video/${path}`, { withFileTypes: true, recursive: true });

	let seasons = 0;
	let episodes = 0;

	entires.forEach((e) => {
		if (e.isDirectory()) seasons++;
		if (e.isFile()) {
			if (!e.name.endsWith('nfo') && !e.name.endsWith('part')) episodes++;
		}
	});

	return { seasons, episodes };
}

export const encrypt = (text: string) => {
	return scryptSync(text, 'salt', 64).toString('hex');
};
