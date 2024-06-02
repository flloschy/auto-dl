import { getMetadata, writeMetadata } from '$lib';
import { downloadYoutubePlaylist, downloadYoutubeVideo } from '$lib/tasks/tasks';
import { type EpisodeNFO } from '$lib/types';
import { readdirSync, rmSync } from 'fs';

export const load = async ({ params }) => {
	const rawFiles = readdirSync(`../storage/video/${params.showFolder}/${params.seasonFolder}`, {
		withFileTypes: true
	});
	const filteredFiles = rawFiles.filter(
		(v) => v.isFile() && !v.name.endsWith('nfo') && !v.name.endsWith('part')
	);

	const mappedFiles = filteredFiles.map((v) => {
		const nfoObject = getMetadata('episode', params.showFolder, params.seasonFolder, v.name);

		return {
			nfo: nfoObject,
			stats: {
				location: v.name,
				runtime: nfoObject.runtime || 'unknown'
			}
		};
	});

	return {
		files: mappedFiles.sort((a, b) => parseInt(a.nfo.episode) - parseInt(b.nfo.episode)),
		params
	};
};

export const actions = {
	editMetadata: async ({ request, params }) => {
		const data = await request.formData();
		const path = data.get('path') as string;
		data.delete('path');

		const nfoObject: Partial<EpisodeNFO> = {};

		Array.from(data.entries()).forEach(
			([key, value]) => (nfoObject[key as keyof EpisodeNFO] = value as string)
		);

		return writeMetadata('episode', nfoObject, params.showFolder, params.seasonFolder, path);
	},
	deleteEpisode: async ({ request, params }) => {
		const data = await request.formData();
		const episodeFile = data.get('path') as string;
		const splittedFile = episodeFile.split('.');
		splittedFile.pop();
		const nfoFile = splittedFile.join('.') + '.nfo';
		const episodeNum = parseInt(
			getMetadata('episode', params.showFolder, params.seasonFolder, episodeFile).episode
		);

		const path = `../storage/video/${params.showFolder}/${params.seasonFolder}/`;

		try {
			rmSync(path + episodeFile);
			rmSync(path + nfoFile);
		} catch (e) {
			return {
				error: {
					title: 'Episode delete fail',
					details: (e as { message: string }).message
				}
			};
		}

		const rawFiles = readdirSync(`../storage/video/${params.showFolder}/${params.seasonFolder}`, {
			withFileTypes: true
		});

		const filteredFiles = rawFiles
			.filter((v) => v.isFile() && !v.name.endsWith('nfo') && !v.name.endsWith('part'))
			.sort((a, b) => {
				const aEpisodeNum = parseInt(
					getMetadata('episode', params.showFolder, params.seasonFolder, a.name).episode
				);
				const bEpisodeNum = parseInt(
					getMetadata('episode', params.showFolder, params.seasonFolder, b.name).episode
				);
				return aEpisodeNum - bEpisodeNum;
			});
		for (let i = episodeNum - 1; i < filteredFiles.length; i++) {
			writeMetadata(
				'episode',
				{ episode: (i + 1).toString() },
				params.showFolder,
				params.seasonFolder,
				filteredFiles[i].name
			);
		}

		return {
			success: {
				title: 'Episode deleted!',
				details: ''
			}
		};
	},
	downloadYoutubeVideo,
	downloadYoutubePlaylist,
	reorderEpisode: async ({ request, params }) => {
		const data = await request.formData();
		const newOrder = (data.get('newOrder') as string).split(',').map((v) => parseInt(v));

		const rawFiles = readdirSync(`../storage/video/${params.showFolder}/${params.seasonFolder}`, {
			withFileTypes: true
		});
		const filteredFiles = rawFiles
			.filter((v) => v.isFile() && !v.name.endsWith('nfo') && !v.name.endsWith('part'))
			.sort((a, b) => {
				const aEpisodeNum = parseInt(
					getMetadata('episode', params.showFolder, params.seasonFolder, a.name).episode
				);
				const bEpisodeNum = parseInt(
					getMetadata('episode', params.showFolder, params.seasonFolder, b.name).episode
				);
				return aEpisodeNum - bEpisodeNum;
			});

		newOrder.forEach((v, i) =>
			writeMetadata(
				'episode',
				{ episode: (i + 1).toString() },
				params.showFolder,
				params.seasonFolder,
				filteredFiles[v - 1].name
			)
		);

		return {
			success: {
				title: 'Reordering Done!',
				details: ''
			}
		};
	}
};
