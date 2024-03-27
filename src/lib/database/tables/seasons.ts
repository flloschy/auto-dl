import Enmap from 'enmap';
import type { Channel } from './channels';
import { getChannel } from '../functions/channels';

type SeasonId = string;

export interface Season {
	id: SeasonId;
	/** Season Number, starting with 0; 0 = default */
	number: number;
	name: string;
	description: string;
	/** The Matching Regex used to decide if a video should be in the season or not */
	regex: string;
	/** The Channel Object which owns the Season */
	channel: Channel;

	/**
	 * The path inside ./data/downloads/channels/
	 * example Channel: NASA
	 * example Season Number: 3
	 * value: "S03"
	 */
	path: string;
}
export interface SeasonInternal {
	id: SeasonId;
	/** Season Number, starting with 0; 0 = default */
	number: number;
	name: string;
	description: string;
	/** The Matching Regex used to decide if a video should be in the season or not */
	regex: string;
	/** The Channel Id which owns the Season */
	channel: string;

	/**
	 * The path inside ./data/downloads/channels/
	 * example Channel: NASA
	 * example Season Number: 3
	 * value: "Season 03"
	 */
	path: string;
}

export const seasons = new Enmap<SeasonId, Season, SeasonInternal>('seasons', {
	dataDir: './data/database/',
	serializer: (season) => ({
		...season,
		channel: season.channel.id
	}),
	deserializer: (season) => {
		return {
			...season,
			channel: getChannel(season.channel) as Channel
		};
	}
});
