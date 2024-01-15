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


export const swapVideos = (
    ChannelId: string,
    SeasonId: string,
    episodeId1: string,
    episodeId2: string,
) => {
    if (!ChannelId || !SeasonId || !episodeId1 || !episodeId2) return false;
    const data = getData();
    if (!data[ChannelId]) return false;
    if (!data[ChannelId].seasons[SeasonId]) return false;
    const season = data[ChannelId].seasons[SeasonId];
    const episode1Num = season.episodes[episodeId1].episodeId;
    const episode2Num = season.episodes[episodeId2].episodeId;
    if (!episode1Num || !episode2Num) return false;
    season.episodes[episodeId1].episodeId = episode2Num;
    season.episodes[episodeId2].episodeId = episode1Num;
    // File naming Sheme: <channelName>/Season 0<seasonNum>/S0<seasonNum>E0<episodeNum> [<video_id>].mp(4/3)

    const episode1SeasonNum = season.seasonNum.toString().padStart(2, '0');
    const episode2SeasonNum = season.seasonNum.toString().padStart(2, '0');
    
    const episode1NumStr = episode1Num.toString().padStart(2, '0');
    const episode2NumStr = episode2Num.toString().padStart(2, '0');
    
    const episode1Identifier = `S${episode1SeasonNum}E${episode1NumStr}`;
    const episode2Identifier = `S${episode2SeasonNum}E${episode2NumStr}`;
    
    const seasonPath = `./data/videos/${data[ChannelId].name}/Season ${episode1SeasonNum}/`;
    
    const fileExtension = season.episodes[episodeId1].audioOnly ? '.mp3' : '.mp4';
    
    fs.renameSync(
        `${seasonPath}${episode1Identifier} [${episodeId1}].${fileExtension}`,
        `${seasonPath}${episode2Identifier} [${episodeId1}].${fileExtension}.tmp`,
    )
    fs.renameSync(
        `${seasonPath}${episode2Identifier} [${episodeId2}].${fileExtension}`,
        `${seasonPath}${episode1Identifier} [${episodeId2}].${fileExtension}.tmp`,
    )
    fs.renameSync(
        `${seasonPath}${episode1Identifier} [${episodeId1}].${fileExtension}.tmp`,
        `${seasonPath}${episode1Identifier} [${episodeId1}].${fileExtension}`,
    )
    fs.renameSync(
        `${seasonPath}${episode2Identifier} [${episodeId2}].${fileExtension}.tmp`,
        `${seasonPath}${episode2Identifier} [${episodeId2}].${fileExtension}`,
    )

    
    setData(data);
    return true;
}
