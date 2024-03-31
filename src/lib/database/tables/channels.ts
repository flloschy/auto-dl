import Enmap from 'enmap';

type ChannelId = string;

export interface Channel {
	id: ChannelId;
	displayName: string;
	description: string;
	downloading: boolean;

	/**
	 * The path inside ./data/downloads/channels/
	 * example Channel: NASA
	 * value: "NASA"
	 */
	path: string;
}

export const channels = new Enmap<ChannelId, Channel>('channels', { dataDir: './data/database/' });
