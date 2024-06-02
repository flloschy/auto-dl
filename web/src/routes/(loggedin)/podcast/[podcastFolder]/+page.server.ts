import { getMetadata, writeMetadata } from '$lib';
import { downloadPodcastPlaylist, downloadPodcastVideo } from '$lib/tasks/tasks';
import { type PodcastEpisodeNFO } from '$lib/types';
import { readdirSync, rmSync } from 'fs';

export const load = async ({ params }) => {
	const rawFiles = readdirSync(`../storage/podcast/${params.podcastFolder}`, {
		withFileTypes: true
	});
	const filteredFiles = rawFiles.filter(
		(v) => v.isFile() && !v.name.endsWith('nfo') && !v.name.endsWith('part')
	);

	const mappedFiles = filteredFiles.map((v) => {
		const nfoObject = getMetadata('podcastEpisode', params.podcastFolder, v.name);
		return {
			nfo: nfoObject,
			stats: {
				location: v.name
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

		const nfoObject: Partial<PodcastEpisodeNFO> = {};

		Array.from(data.entries()).forEach(
			([key, value]) => (nfoObject[key as keyof PodcastEpisodeNFO] = value as string)
		);

		return writeMetadata('podcastEpisode', nfoObject, params.podcastFolder, path);
	},
	deleteEpisode: async ({ request, params }) => {
		const data = await request.formData();
		const episodeFile = data.get('path') as string;
		const splittedFile = episodeFile.split('.');
		splittedFile.pop();
		const nfoFile = splittedFile.join('.') + '.nfo';
		const path = `../storage/podcast/${params.podcastFolder}/`;
		const episodeNum = parseInt(
			getMetadata('podcastEpisode', params.podcastFolder, episodeFile).episode
		);

		try {
			try {
				rmSync(path + nfoFile);
			} catch {
				/*empty*/
			}
			rmSync(path + episodeFile);
		} catch (e) {
			return {
				error: {
					title: 'Episode delete fail',
					details: (e as { message: string }).message
				}
			};
		}

		const rawFiles = readdirSync(`../storage/podcast/${params.podcastFolder}`, {
			withFileTypes: true
		});

		const filteredFiles = rawFiles
			.filter((v) => v.isFile() && !v.name.endsWith('nfo') && !v.name.endsWith('part'))
			.sort((a, b) => {
				const aEpisodeNum = parseInt(
					getMetadata('podcastEpisode', params.podcastFolder, a.name).episode
				);
				const bEpisodeNum = parseInt(
					getMetadata('podcastEpisode', params.podcastFolder, b.name).episode
				);
				return aEpisodeNum - bEpisodeNum;
			});

		for (let i = episodeNum - 1; i < filteredFiles.length; i++) {
			writeMetadata(
				'podcastEpisode',
				{ episode: (i + 1).toString() },
				params.podcastFolder,
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
	downloadPodcastVideo,
	downloadPodcastPlaylist,
	reorderEpisode: async ({ request, params }) => {
		const data = await request.formData();
		const newOrder = (data.get('newOrder') as string).split(',').map((v) => parseInt(v));

		const rawFiles = readdirSync(`../storage/podcast/${params.podcastFolder}`, {
			withFileTypes: true
		});

		const filteredFiles = rawFiles
			.filter((v) => v.isFile() && !v.name.endsWith('nfo') && !v.name.endsWith('part'))
			.sort((a, b) => {
				const aEpisodeNum = parseInt(
					getMetadata('podcastEpisode', params.podcastFolder, a.name).episode
				);
				const bEpisodeNum = parseInt(
					getMetadata('podcastEpisode', params.podcastFolder, b.name).episode
				);
				return aEpisodeNum - bEpisodeNum;
			});
		newOrder.forEach((v, i) =>
			writeMetadata(
				'podcastEpisode',
				{ episode: (i + 1).toString() },
				params.podcastFolder,
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
