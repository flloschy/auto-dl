import { getMetadata, writeMetadata } from '$lib';
import { titleToFolderName } from '$lib/frontendUtil.js';
import { type AlbumNFO, type ShowNFO } from '$lib/types';
import { mkdirSync, readdirSync, rmSync } from 'fs';

export const load = async () => {
	const rawFiles = readdirSync('../storage/podcast', { withFileTypes: true });
	const filteredFiles = rawFiles.filter((v) => v.isDirectory());
	const mappedFiles = filteredFiles.map((v) => ({
		nfo: getMetadata('podcast', v.name),
		stats: {
			location: v.name,
			episodes: readdirSync('../storage/podcast', { withFileTypes: true }).filter(
				(v) => v.isFile() && v.name.endsWith('mp3')
			).length
		}
	}));
	return { podcasts: mappedFiles };
};

export const actions = {
	editMetadata: async ({ request }) => {
		const data = await request.formData();
		const path = data.get('path') as string;
		data.delete('path');
		const nfoObject: Partial<AlbumNFO> = {};
		Array.from(data.entries()).forEach(
			([key, value]) => (nfoObject[key as keyof AlbumNFO] = value as string)
		);
		return writeMetadata('podcast', nfoObject, path);
	},
	deletePodcast: async ({ request }) => {
		const data = await request.formData();
		const showPath = data.get('path') as string;
		const path = `../storage/podcast/${showPath}/`;
		try {
			rmSync(path, { recursive: true });
		} catch (e) {
			return {
				error: {
					title: 'Podcast delete fail',
					details: (e as { message: string }).message
				}
			};
		}
		return {
			success: {
				title: 'Podcast Deleted!',
				details: ''
			}
		};
	},
	createPodcast: async ({ request }) => {
		const data = await request.formData();
		const nfoObject: Partial<ShowNFO> & { title: string } = { title: '' };
		data.forEach((value, key) => {
			nfoObject[key as keyof ShowNFO] = value as string;
		});

		try {
			mkdirSync(`../storage/podcast/${titleToFolderName(nfoObject.title)}`);
			return writeMetadata('podcast', nfoObject, titleToFolderName(nfoObject.title));
		} catch (e) {
			return {
				error: {
					title: 'Created Podcast failed',
					details: (e as { message: string }).message
				}
			};
		}
	}
};
