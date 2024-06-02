import { countSeasonsAndEpisodes, getMetadata, writeMetadata } from '$lib';
import { titleToFolderName } from '$lib/frontendUtil.js';
import { type ShowNFO } from '$lib/types';
import { mkdirSync, readdirSync, rmSync } from 'fs';

export const load = async () => {
	const rawFiles = readdirSync('../storage/video', { withFileTypes: true });
	const filteredFiles = rawFiles.filter((v) => v.isDirectory());
	const mappedFiles = filteredFiles.map((v) => ({
		nfo: getMetadata('show', v.name),
		stats: {
			location: v.name,
			...countSeasonsAndEpisodes(v.name)
		}
	}));
	return { shows: mappedFiles };
};

export const actions = {
	editMetadata: async ({ request }) => {
		const data = await request.formData();
		const path = data.get('path') as string;
		data.delete('path');
		const nfoObject: Partial<ShowNFO> = {};
		Array.from(data.entries()).forEach(
			([key, value]) => (nfoObject[key as keyof ShowNFO] = value as string)
		);
		return writeMetadata('show', nfoObject, path);
	},
	deleteShow: async ({ request }) => {
		const data = await request.formData();
		const showPath = data.get('path') as string;
		const path = `../storage/video/${showPath}/`;
		try {
			rmSync(path, { recursive: true });
		} catch (e) {
			return {
				error: {
					title: 'Show delete fail',
					details: (e as { message: string }).message
				}
			};
		}
		return {
			success: {
				title: 'Show deleted!',
				details: ''
			}
		};
	},
	createChannel: async ({ request }) => {
		const data = await request.formData();
		const nfoObject: Partial<ShowNFO> & { title: string } = { title: '' };
		data.forEach((value, key) => {
			nfoObject[key as keyof ShowNFO] = value as string;
		});

		try {
			mkdirSync(`../storage/video/${titleToFolderName(nfoObject.title)}`);
			return writeMetadata('show', nfoObject, titleToFolderName(nfoObject.title));
		} catch (e) {
			return {
				error: {
					title: 'Create channel failed',
					details: (e as { message: string }).message
				}
			};
		}
	}
};
