import { readFileSync } from 'fs';
import { getData } from '$lib/data/access';
import { totalmem, freemem, cpuUsage } from 'os-utils';
import checkDiskSpace from 'check-disk-space';

/**
 * Gets current Waitlist, Channellist amount, and existing channels, seasons and episodes
 * @returns
 */
export function getStats() {
	const data = getData();

	const onWaitlist =
		readFileSync('./data/waitlist.txt', { encoding: 'utf-8' }).split('\n')
			.length - 1;
	const onChannellist = Object.values(data).filter(
		(c) => c.automaticDownloading,
	).length;

	const channels = Object.keys(data).length;
	const seasons = Object.values(data)
		.map((channel) => Object.keys(channel.seasons).length)
		.reduce((previous, current) => previous + current, 0);
	const episodes = Object.values(data)
		.map((channel) =>
			Object.values(channel.seasons)
				.map((season) => Object.values(season.episodes).length)
				.reduce((previous, current) => previous + current, 0),
		)
		.reduce((previous, current) => previous + current, 0);

	return {
		onWaitlist,
		onChannellist,
		channels,
		seasons,
		episodes,
	};
}

export function getMemoryUsage() {
	return ((totalmem() - freemem()) / totalmem()) * 100;
}

export async function getCPUusage() {
	async function sub() {
		return await new Promise((resolve) => {
			cpuUsage((percentage) => {
				const value = percentage * 1000;
				resolve(value);
			});
		});
	}
	return await sub();
}

export async function getStorageUsage() {
	async function sub() {
		return await new Promise((resolve) => {
			checkDiskSpace('C:/').then((diskSpace) => {
				resolve(
					((diskSpace.size - diskSpace.free) / diskSpace.size) * 100,
				);
			});
		});
	}
	return await sub();
}
