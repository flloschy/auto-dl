import { getData, setData } from '$lib/data/access';
import fs from 'node:fs';
import { cachedDataVersionTag } from 'node:v8';
/**
 * @param channelId
 * @param newChannelName
 * @param newChannelDescription
 * @param automaticDownloading If Videos from this channel should be downloaded automatically
 * @returns
 */
export const updateChannel = (
	channelId: string,
	newChannelName: string,
	newChannelDescription: string,
	automaticDownloading: boolean,
	audioOnly: boolean,
) => {
	if (!channelId || !newChannelName || !newChannelDescription) return false;
	const data = getData();
	if (!data[channelId]) return false;

    
    if (data[channelId].name != newChannelName) {
        const names = Object.values(data).map((channel) => channel.name);
        if (names.includes(newChannelName)) return false;
        try {
            fs.renameSync(
            `./data/videos/${data[channelId].name}`,
            `./data/videos/${newChannelName}`,
            );
        } catch (e) {
            console.log(e)
        }
    }

	data[channelId].name = newChannelName;
	data[channelId].description = newChannelDescription;
	data[channelId].automaticDownloading = automaticDownloading;
	data[channelId].audioOnly = audioOnly;

    console.log(data[channelId].description)
        
	setData(data);
	return true;
};

/**
 * @returns false if channel doesn't exist or season doesn't exist
 */
export const updateSeason = (
	ChannelId: string,
	SeasonId: string,
	newSeasonName: string,
	newSeasonDescription: string,
	newRegex: string,
) => {
	if (
		!ChannelId ||
		!SeasonId ||
		!newSeasonName ||
		!newSeasonDescription ||
		!newRegex
	)
		return false;
	const data = getData();
	if (!data[ChannelId]) return false;
	if (!data[ChannelId].seasons[SeasonId]) return false;
	data[ChannelId].seasons[SeasonId].name = newSeasonName;
	data[ChannelId].seasons[SeasonId].description = newSeasonDescription;
	data[ChannelId].seasons[SeasonId].regex = newRegex;
	setData(data);
	return true;
};
