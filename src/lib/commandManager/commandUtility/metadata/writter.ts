/* eslint-disable @typescript-eslint/no-explicit-any */
import { XMLBuilder } from 'fast-xml-parser';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import type { AlbumNFO, EpisodeNFO, PodcastNFO, SeasonNFO, ShowNFO } from './types';
import {
	readEpisodeNFO,
	readPlaylistNFO,
	readPodcastEpisodeNFO,
	readPodcastNFO,
	readSeasonNFO,
	readShowNFO
} from './reader';
import { cleanFlatObject, extractSectionsFromFile } from '$lib/utility';
import Logger from '$lib/logger';

const mainLogger = Logger.getLogger('NFO writer');
const playlistLogger = mainLogger.getLogger('Playlist');
const podcastLogger = mainLogger.getLogger('Podcast');
const showLogger = mainLogger.getLogger('Show');
const seasonLogger = mainLogger.getLogger('Season');
const episodeLogger = mainLogger.getLogger('Episode');

function setFile(location: string, obj: any) {
	const data = new XMLBuilder().build(obj);
	writeFileSync(location, data);
}

export function writePlaylistNFO(playlist: string, data: Partial<AlbumNFO>) {
	if (!existsSync(`./downloads/music/${playlist}`)) {
		playlistLogger.debug(playlist, ':', '<creating path>');
		mkdirSync(`./downloads/music/${playlist}`);
	}
	playlistLogger.debug(playlist, ':', JSON.stringify(data));
	const oldData = readPlaylistNFO(playlist);
	setFile(`./downloads/music/${playlist}/album.nfo`, {
		album: { ...oldData, ...cleanFlatObject(data) }
	});
}

export function writePodcastNFO(podcast: string, data: Partial<PodcastNFO>) {
	if (!existsSync(`./downloads/podcast/${podcast}`)) {
		podcastLogger.debug(podcast, ':', '<creating path>');
		mkdirSync(`./downloads/podcast/${podcast}`);
	}
	podcastLogger.debug(podcast, ':', JSON.stringify(data));
	const oldData = readPodcastNFO(podcast);
	setFile(`./downloads/podcast/${podcast}/album.nfo`, {
		album: { ...oldData, ...cleanFlatObject(data) }
	});
}

export function writeShowNFO(show: string, data: Partial<ShowNFO>) {
	if (!existsSync(`./downloads/youtube/${show}`)) {
		showLogger.debug(show, ':', '<creating path>');
		mkdirSync(`./downloads/youtube/${show}`);
	}
	showLogger.debug(show, ':', JSON.stringify(data));
	const oldData = readShowNFO(show);
	setFile(`./downloads/youtube/${show}/tvshow.nfo`, {
		tvshow: { ...oldData, ...cleanFlatObject(data) }
	});
}

export function writeSeasonNFO(show: string, season: string, data: Partial<SeasonNFO>) {
	if (!existsSync(`./downloads/youtube/${show}/${season}`)) {
		seasonLogger.debug(show, '/', season, ':', '<creating path>');
		mkdirSync(`./downloads/youtube/${show}/${season}`);
	}
	seasonLogger.debug(show, '/', season, ':', JSON.stringify(data));
	const oldData = readSeasonNFO(show, season);
	setFile(`./downloads/youtube/${show}/${season}/season.nfo`, {
		season: { ...oldData, ...cleanFlatObject(data) }
	});
}
export function writeEpisodeNFO(
	show: string,
	season: string,
	episode: string,
	data: Partial<EpisodeNFO>
) {
	episodeLogger.debug(show, '/', season, '/', episode, ':', JSON.stringify(data));
	const oldData = readEpisodeNFO(show, season, episode);
	const path = `./downloads/youtube/${show}/${season}/${episode}`;
	const sections = extractSectionsFromFile(path);
	setFile(`${sections.path}/${sections.fileName}.nfo`, {
		episodedetails: { ...oldData, ...cleanFlatObject(data) }
	});
}
export function writePodcastEpisodeNFO(
	podcast: string,
	episode: string,
	data: Partial<EpisodeNFO>
) {
	episodeLogger.debug(podcast, '/', episode, ':', JSON.stringify(data));
	const oldData = readPodcastEpisodeNFO(podcast, episode);
	const path = `./downloads/podcast/${podcast}/${episode}`;
	const sections = extractSectionsFromFile(path);
	setFile(`${sections.path}/${sections.fileName}.nfo`, {
		episodedetails: { ...oldData, ...cleanFlatObject(data) }
	});
}
