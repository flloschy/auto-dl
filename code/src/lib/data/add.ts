import { genId } from '$lib/helper';
import { type Season, type Channel, emptySeason } from '$lib/data/interfaces';
import { getData, setData } from '$lib/data/access';

/**
 * @param id The ID of the youtube channel
 * @param name
 * @param description
 * @param autodl If videos on the channel will downloaded automatically
 * @returns false if channel already exists
 */
export const addChannel = (
	id: string,
	name: string,
	description: string,
	autodl: boolean,
	audioOnly: boolean,
) => {
	if (!id || !name || !description) return false;
	const d = getData();
	if (d[id]) return false;

	const channel: Channel = {
		channelId: id,
		name,
		description,
		automaticDownloading: autodl,
		seasons: emptySeason,
		audioOnly,
	};

	d[id] = channel;
	setData(d);
	return true;
};

/**
 * @param youtubeChannelId The ID of the youtube channel
 * @param seasonName Name of the season
 * @param seasonDescription
 * @param regex The regex which will be used to decided where to put a video
 * @returns seasonID or false when channel doesnt exist
 */
export const addSeason = (
	youtubeChannelId: string,
	seasonName: string,
	seasonDescription: string,
	regex: string,
) => {
	if (!youtubeChannelId || !seasonName || !seasonDescription || !regex)
		return false;
	const data = getData();
	if (!data[youtubeChannelId]) return false;
	const keys = Object.keys(!data[youtubeChannelId].seasons);
	const seasonId = genId(keys);
	const season: Season = {
		seasonNum:
			Object.values(data[youtubeChannelId].seasons)
				.map((season) => season.seasonNum)
				.sort((a, b) => a - b)[0] + 1,
		seasonId: seasonId,
		name: seasonName,
		description: seasonDescription,
		regex,
		updated: -1,
		deletable: true,
		episodes: {},
	};
	data[youtubeChannelId].seasons[seasonId] = season;
	setData(data);
	return seasonId;
};
