import { NFODateFormatter } from './frontendUtil';

export interface TaskState {
	id: string;
	title: string;
	detail: string;
	progress: number;
	process: 'yt' | 'spot' | 'audio' | 'system';
	state: 'running' | 'done' | 'error';
	toastId?: string;
	finished: number;
}

export type Files = string[];
export interface Folders {
	[path: string]: Folder;
}
export interface Folder {
	files: Files;
	folders: Folders;
}

export interface ShowNFO {
	title: string;
	originaltitle: string;
	dateadded: string;
	releasedate: string;
	youtubemetadataid: string;
	studio: string;
	plot: string;
	trailer: string;
}
export const defaultShow = (dir: string, added: number): ShowNFO => ({
	title: dir,
	originaltitle: dir,
	dateadded: NFODateFormatter(new Date(added)),
	releasedate: NFODateFormatter(new Date(0)),
	studio: 'unknown',
	plot: '',
	youtubemetadataid: '',
	trailer: ''
});

export interface SeasonNFO {
	title: string;
	originaltitle: string;
	seasonnumber: string;
	trailer: string;
	dateadded: string;
	plot: string;
}
export const defaultSeason = (dir: string, added: number, num: string): SeasonNFO => ({
	title: dir,
	originaltitle: dir,
	seasonnumber: num,
	dateadded: NFODateFormatter(new Date(added)),
	plot: '',
	trailer: ''
});
export interface EpisodeNFO {
	title: string;
	episode: string;
	originaltitle: string;
	runtime: string;
	dateadded: string;
	aired: string;
	plot: string;
	youtubemetadataid: string;
	trailer: string;
}
export const defaultEpisode = (dir: string, added: number, num: string): EpisodeNFO => ({
	title: dir,
	episode: num,
	originaltitle: dir,
	runtime: 'unknown',
	dateadded: NFODateFormatter(new Date(added)),
	aired: NFODateFormatter(new Date(0)),
	plot: '',
	youtubemetadataid: '',
	trailer: ''
});

export interface Broadcast_able {
	taskUpdate?: TaskState;
	toastUpdate?: {
		id?: string;
		title: string;
		description: string;
		type: 'error' | 'success' | 'info';
	};
	removeTask?: string;
}

export type Tasks = { [key: string]: TaskState };

export interface AlbumNFO {
	title: string;
	originaltitle: string;
	dateadded: string;
	plot: string;
}
export const defaultAlbum = (dir: string, added: number): AlbumNFO => ({
	title: dir,
	originaltitle: dir,
	dateadded: NFODateFormatter(new Date(added)),
	plot: ''
});
export type PodcastNFO = AlbumNFO;
export const defaultPodcast = defaultAlbum;

export type PodcastEpisodeNFO = Omit<EpisodeNFO, 'trailer'>;
export const defaultPodcastEpisode = (
	dir: string,
	added: number,
	num: string
): PodcastEpisodeNFO => {
	const episode = defaultEpisode(dir, added, num) as object & { trailer?: string };
	delete episode.trailer;
	return episode as PodcastEpisodeNFO;
};
