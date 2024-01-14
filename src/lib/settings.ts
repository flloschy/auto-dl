import fs from 'node:fs';

interface Settings {
	autoDownloadingEnabled: boolean;
	channelListIntervalTime: number;
	waitListIntervalTime: number;
}

export const getSettings = () => {
	const settings = JSON.parse(
		fs.readFileSync('./data/settings.json') as unknown as string,
	) as Settings;
	return settings;
};

export const setSettings = (settings: Settings) => {
	fs.writeFileSync('./data/settings.json', JSON.stringify(settings));
	return true;
};
