import type { Data } from '$lib/data/interfaces';
import { readFileSync, writeFileSync } from 'fs';

export const getData = (): Data => {
	return JSON.parse(
		readFileSync('./data/data.json', { encoding: 'utf-8' }),
	) as Data;
};

/**
 * Overwrite the `data.json`
 *@returns true
 */
export const setData = (data: Data): true => {
	writeFileSync('./data/data.json', JSON.stringify(data));
	return true;
};

/**
 * @param channelId The Channel ID
 * @returns false if channel doesn't exist
 */
export const getChannel = (channelId: string) => {
	const data = getData();
	const channel = data[channelId];
	if (!channel) return false;
	return channel;
};
