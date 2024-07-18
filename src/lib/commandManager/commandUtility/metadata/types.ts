

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

export interface SeasonNFO {
	title: string;
	originaltitle: string;
	seasonnumber: string;
	trailer: string;
	dateadded: string;
	plot: string;
}

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

export interface PodcastEpisodeNFO {
	title: string;
	episode: string;
	originaltitle: string;
	runtime: string;
	dateadded: string;
	aired: string;
	plot: string;
	youtubemetadataid: string;
}

export interface AlbumNFO {
	title: string;
	originaltitle: string;
	dateadded: string;
	plot: string;
}

export interface PodcastNFO {
	title: string;
	originaltitle: string;
	dateadded: string;
	plot: string;
}