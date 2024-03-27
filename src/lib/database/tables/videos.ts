import Enmap from 'enmap';
import { getChannel } from '../functions/channels';
import { getSeason } from '../functions/seasons';
import type { Season } from './seasons';
import type { Channel } from './channels';

export type YoutubeId = string;

export interface Video {
	/** The Video watch ID */
	id: YoutubeId;
	/** The Channel Object found in the channels table */
	channel: Channel;
	/** The Season Object found in the seasons table */
	season: Season;
	/** The length of the video in seconds */
	length: number;
	/** The Size of the video in KiloBytes */
	size: number;
	/** The Date object of when this video was downloaded */
	time: Date;
	title: string;
	/** The position of the video in a Season */
	num: number;

	/**
	 * The path inside ./data/downloads/channels/
	 * example Channel: NASA
	 * example Season Number: 3
	 * example Video Id: ON5taF2vBF0
	 * example Video Num: 34
	 * value: "S03E34 [ON5taF2vBF0].mp4"
	 */
	path: string;
}

interface VideoInternal {
	/**The Video watch ID */
	id: YoutubeId;
	/** The Channel ID found in the channels table */
	channel: string;
	/** The Season ID found in the seasons table */
	season: string;
	/** The length of the video in seconds */
	length: number;
	/** The Size of the video in KiloBytes */
	size: number;
	/** The Date object of when this video was downloaded (ISO-string)*/
	time: string;
	title: string;
	/** The position of the video in a Season */
	num: number;

	/**
	 * The path inside ./data/downloads/channels/
	 * example Channel: NASA
	 * example Season Number: 3
	 * example Video Id: ON5taF2vBF0
	 * example Video Num: 34
	 * value: "S03E34 [ON5taF2vBF0].mp4"
	 */
	path: string;
}

export const videos = new Enmap<YoutubeId, Video, VideoInternal>('videos', {
	dataDir: './data/database/',
	serializer: (video) => ({
		...video,
		channel: video.channel.id,
		season: video.season.id,
		time: video.time.toISOString()
	}),
	deserializer: (video) => ({
		...video,
		channel: getChannel(video.channel) as Channel,
		season: getSeason(video.season) as Season,
		time: new Date(video.time)
	})
});
