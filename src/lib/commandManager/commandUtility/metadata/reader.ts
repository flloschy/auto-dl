import { XMLParser } from 'fast-xml-parser';
import { readFileSync, readdirSync } from 'fs';
import type {
	AlbumNFO,
	EpisodeNFO,
	PodcastEpisodeNFO,
	PodcastNFO,
	SeasonNFO,
	ShowNFO
} from './types';
import {
	NFODateFormatter,
	extractSectionsFromFile,
	getFolderNumber,
	pathAge,
	removeNonAsciiRegex
} from '$lib/utility';
import Logger from '$lib/logger';

const mainLogger = Logger.getLogger('NFO reader');
const playlistLogger = mainLogger.getLogger('Playlist');
const podcastLogger = mainLogger.getLogger('Podcast');
const showLogger = mainLogger.getLogger('Show');
const seasonLogger = mainLogger.getLogger('Season');
const episodeLogger = mainLogger.getLogger('Episode');
const podcastEpisodeLogger = mainLogger.getLogger('Podcast Episode');

function getFile(location: string) {
	try {
		const data = readFileSync(location).toString();
		return new XMLParser().parse(data);
	} catch {
		return false;
	}
}

export function readPlaylistNFO(playlist: string): AlbumNFO {
	playlistLogger.debug(playlist);
	const path = `./downloads/music/${playlist}`;
	const xml = getFile(`${path}/album.nfo`);
	const title = playlist.replaceAll(removeNonAsciiRegex, '');
	let metadata: AlbumNFO = {
		title: title,
		dateadded: NFODateFormatter(pathAge(path)),
		originaltitle: title,
		plot: ''
	};

	if (xml) {
		metadata = { ...metadata, ...xml.album };
	}

	return metadata;
}

export function readPodcastNFO(podcast: string): PodcastNFO {
	podcastLogger.debug(podcast);
	const path = `./downloads/podcast/${podcast}`;
	const xml = getFile(`${path}/album.nfo`);
	const title = podcast.replaceAll(removeNonAsciiRegex, '');
	let metadata: PodcastNFO = {
		title: title,
		dateadded: NFODateFormatter(pathAge(path)),
		originaltitle: title,
		plot: ''
	};

	if (xml) {
		metadata = { ...metadata, ...xml.album };
	}

	return metadata;
}

export function readShowNFO(show: string): ShowNFO {
	showLogger.debug(show);
	const path = `./downloads/youtube/${show}`;
	const xml = getFile(`${path}/tvshow.nfo`);
	const title = show.replaceAll(removeNonAsciiRegex, '');
	let metadata: ShowNFO = {
		title: title,
		dateadded: NFODateFormatter(pathAge(path)),
		originaltitle: title,
		plot: '',
		releasedate: NFODateFormatter(new Date()),
		studio: '',
		trailer: '',
		youtubemetadataid: ''
	};

	if (xml) {
		metadata = { ...metadata, ...xml.tvshow };
	}

	return metadata;
}

export function readSeasonNFO(show: string, season: string): SeasonNFO {
	seasonLogger.debug(show, '/', season);
	const path = `./downloads/youtube/${show}/${season}`;
	const xml = getFile(`${path}/season.nfo`);
	const title = show.replaceAll(removeNonAsciiRegex, '');
	let metadata: SeasonNFO = {
		title: title,
		dateadded: NFODateFormatter(pathAge(path)),
		originaltitle: title,
		plot: '',
		trailer: '',
		seasonnumber: getFolderNumber(path).toString()
	};

	if (xml) {
		metadata = { ...metadata, ...xml.season };
	}

	return metadata;
}

export function readEpisodeNFO(show: string, season: string, episode: string): EpisodeNFO {
	episodeLogger.debug(show, '/', season, '/', episode);
	const path = `./downloads/youtube/${show}/${season}/${episode}`;
	const xml = getFile(`${path}/season.nfo`);
	const title = show.replaceAll(removeNonAsciiRegex, '');

	const folders = readdirSync(`./downloads/youtube/${show}/${season}`, { withFileTypes: true });
	const files = folders.filter(
		(entry) => entry.isFile() && !entry.name.endsWith('nfo') && !entry.name.endsWith('json')
	);
	let episodeNum = files.length;

	for (let index = 0; index < files.length; index++) {
		const file = files[index];
		if (file.name == episode) {
			episodeNum = index + 1;
			break;
		}
	}

	let metadata: EpisodeNFO = {
		title: title,
		dateadded: NFODateFormatter(pathAge(path)),
		originaltitle: title,
		plot: '',
		aired: NFODateFormatter(new Date()),
		trailer: '',
		youtubemetadataid: '',
		episode: episodeNum.toString(),
		runtime: '-1'
	};

	if (xml) {
		metadata = { ...metadata, ...xml.episodedetails };
	}

	return metadata;
}
export function readPodcastEpisodeNFO(podcast: string, episode: string): PodcastEpisodeNFO {
	podcastEpisodeLogger.debug(podcast, '/', episode);
	const path = `./downloads/podcast/${podcast}/${episode}`;
	const segments = extractSectionsFromFile(path);
	const xml = getFile(`${segments.path}/${segments.fileName}.nfo`);
	const title = episode.replaceAll(removeNonAsciiRegex, '');

	const folders = readdirSync(`./downloads/podcast/${podcast}`, { withFileTypes: true });
	const files = folders.filter((entry) => entry.isFile() && entry.name.endsWith('.mp3'));
	let episodeNum = files.length;

	for (let index = 0; index < files.length; index++) {
		const file = files[index];
		if (file.name == episode) {
			episodeNum = index + 1;
			break;
		}
	}

	let metadata: EpisodeNFO = {
		title: title,
		dateadded: NFODateFormatter(pathAge(path)),
		originaltitle: title,
		plot: '',
		aired: NFODateFormatter(new Date()),
		trailer: '',
		youtubemetadataid: '',
		episode: episodeNum.toString(),
		runtime: '-1'
	};

	if (xml) {
		metadata = { ...metadata, ...xml.episodedetails };
	}

	return metadata;
}
