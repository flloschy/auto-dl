import { getData, setData } from '$lib/data/access';
import fs from 'fs';

export const deleteChannel = (channelId: string) => {
	const data = getData();
	fs.rm(`./data/videos/${data[channelId].name}/`, ()=>{});
	delete data[channelId];
	setData(data);
	return true;
};
/**
 * @returns false if season is not deletable
 */
export const deleteSeason = (channelId: string, seasonId: string) => {
	const data = getData();
	if (!data[channelId].seasons[seasonId].deletable) return false;
	const channelName = data[channelId].name;
	const seasonName = (
		Object.values(data[channelId].seasons).find(
			(season) => season.seasonId == seasonId,
		)?.seasonNum ?? 0
	).toString();
	fs.rmSync(
		`./data/videos/${channelName}/Season ${seasonName.padStart(2, '0')}/`,
		{
			recursive: true,
		},
	);
	delete data[channelId].seasons[seasonId];
	setData(data);
	return true;
};

export const deleteEpisode = (
	channelId: string,
	seasonId: string,
	episodeId: number,
) => {
	const data = getData();
	if (!data[channelId].seasons[seasonId]) return false;
	const key = Object.values(data[channelId].seasons[seasonId].episodes).find(
		(e) => e.episodeId == episodeId,
	)?.videoId;
	if (!key) return false;

	const channelName = data[channelId].name;
	const seasonName = (data[channelId].seasons[seasonId].seasonNum ?? 0)
		.toString()
		.padStart(2, '0');
	const episodeName = `S${seasonName}E${data[channelId].seasons[
		seasonId
	].episodes[key].episodeId
		.toString()
		.padStart(2, '0')} [${
		data[channelId].seasons[seasonId].episodes[key].videoId
	}].`;

	try {
		fs.rmSync(
			`./data/videos/${channelName}/Season ${seasonName}/${episodeName}mp4`,
		);
	} catch {
		fs.rmSync(
			`./data/videos/${channelName}/Season ${seasonName}/${episodeName}mp3`,
		);
	}

	delete data[channelId].seasons[seasonId].episodes[key];
	setData(data);
	return true;
};
