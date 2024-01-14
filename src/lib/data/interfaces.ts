export interface Episode {
	episodeId: number;
	name: string;
	youtubeLink: string;
	videoId: string;
	length: number;
	size: number;
	downloadDate: number;
}

export interface Episodes {
	[episodeId: string]: Episode;
}

export interface Season {
	seasonNum: number;
	seasonId: string;
	name: string;
	description: string;
	regex: string;
	updated: number;
	deletable: boolean;
	episodes: Episodes;
}

export interface Seasons {
	[seasonId: string]: Season;
}

export interface Channel {
	audioOnly: boolean;
	channelId: string;
	name: string;
	description: string;
	automaticDownloading: boolean;
	seasons: Seasons;
}

/**
 * `data.json` format
 */
export interface Data {
	[channelId: string]: Channel;
}

export const emptySeason: Seasons = {
	default: {
		seasonId: 'default',
		name: 'unsorted',
		seasonNum: 0,
		description:
			'the place where videos end up when no other seasons regex gets trigged',
		regex: '.*',
		updated: -1,
		deletable: false,
		episodes: {},
	},
};
