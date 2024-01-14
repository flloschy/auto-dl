import fs from 'node:fs';

interface Settings {
	autoDownloadingEnabled: boolean;
	channelListIntervalTime: number;
	waitListIntervalTime: number;
    systemRoot:string;
    pythonCommand:string,
}

export const getSettings = () => {
	const settings = JSON.parse(
		fs.readFileSync('./data/settings.json') as unknown as string,
	) as Settings;
	return settings;
};

export const setSettings = (settings: Partial<Settings>) => {
    const currentSettings = getSettings();
    const newSettings = {...currentSettings, ...settings};
    fs.writeFileSync('./data/settings.json', JSON.stringify(newSettings));
	return true;
};
