import { getMetadata, writeMetadata } from '$lib';
import { titleToFolderName } from '$lib/frontendUtil';
import { syncPlaylist } from '$lib/tasks/tasks';
import type { AlbumNFO } from '$lib/types.js';
import { mkdirSync, readdirSync, rmSync } from 'fs';

export const load = async () => {
	const rawPlaylists = readdirSync('../storage/music');
	const mappedPlaylists = rawPlaylists.map((playlist) => ({
		stats: {
			location: playlist,
			songs: readdirSync(`../storage/music/${playlist}`, {
				withFileTypes: true,
				recursive: true
			}).filter((v) => v.isFile() && v.name.endsWith('mp3')).length
		},
		nfo: getMetadata('album', playlist)
	}));
	return { albums: mappedPlaylists };
};

export const actions = {
	createPlaylist: async ({ request }) => {
		const data = await request.formData();
		const title = data.get('title') as string;
		if (!title)
			return {
				error: {
					title: 'Title missing',
					details: ''
				}
			};
		const plot = (data.get('plot') || '') as string;
		const formattedTitle = titleToFolderName(title);
		try {
			mkdirSync(`../storage/music/${formattedTitle}`);
			return writeMetadata('album', { plot }, formattedTitle);
		} catch (e) {
			return {
				error: {
					title: 'Failed',
					details: (e as { message: string }).message
				}
			};
		}
	},
	editMetadata: async ({ request }) => {
		const data = await request.formData();
		const path = data.get('path');
		if (!path)
			return {
				error: {
					title: 'no path given',
					details: ''
				}
			};
		data.delete('path');

		const nfoOverwrite: Partial<AlbumNFO> = {};
		Array.from(data.entries()).forEach(([key, value]) => {
			nfoOverwrite[key as keyof AlbumNFO] = value as string;
		});

		return writeMetadata('album', nfoOverwrite, path as string);
	},
	syncPlaylist,
	deletePlaylist: async ({ request }) => {
		const data = await request.formData();
		try {
			rmSync(`../storage/music/${data.get('path')}`, {
				recursive: true,
				force: true
			});
			return {
				success: {
					title: 'Playlist deleted',
					details: ''
				}
			};
		} catch (e) {
			return {
				error: {
					title: 'Playlist delete Failed',
					details: (e as { message: string }).message
				}
			};
		}
	}
};
