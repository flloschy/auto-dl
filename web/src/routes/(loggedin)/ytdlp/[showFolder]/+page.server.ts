import { countSeasonsAndEpisodes, getMetadata, writeMetadata } from '$lib';
import { type SeasonNFO } from '$lib/types';
import { mkdirSync, readdirSync, renameSync, rmSync } from 'fs';

export const load = async ({ params }) => {
	const rawFiles = readdirSync(`../storage/video/${params.showFolder}`, { withFileTypes: true });
	const filteredFiles = rawFiles.filter((v) => v.isDirectory());
	const mappedFiles = filteredFiles.map((v) => ({
		nfo: getMetadata('season', params.showFolder, v.name),
		stats: {
			location: v.name,
			episodes: countSeasonsAndEpisodes(`${params.showFolder}/${v.name}`).episodes
		}
	}));
	return { seasons: mappedFiles, params };
};

export const actions = {
	editMetadata: async ({ request, params }) => {
		const data = await request.formData();
		const path = data.get('path') as string;
		data.delete('path');
		const nfoObject: Partial<SeasonNFO> = {};
		Array.from(data.entries()).forEach(
			([key, value]) => (nfoObject[key as keyof SeasonNFO] = value as string)
		);

		return writeMetadata('season', nfoObject, params.showFolder, path);
	},
	deleteSeason: async ({ request, params }) => {
		const data = await request.formData();
		const seasonPath = data.get('path') as string;
		const path = `../storage/video/${params.showFolder}/${seasonPath}/`;
		try {
			rmSync(path, { recursive: true });
		} catch (e) {
			return {
				error: {
					title: 'Season delete fail',
					details: (e as { message: string }).message
				}
			};
		}
		return {
			success: {
				title: 'Season deleted!',
				details: ''
			}
		};
	},
	createSeason: async ({ request, params }) => {
		const data = await request.formData();
		const seasonNum = (
			readdirSync(`../storage/video/${params.showFolder}/`, { withFileTypes: true }).filter((v) =>
				v.isDirectory()
			).length + 1
		).toString();
		const nfoObject: Partial<SeasonNFO> = {};
		data.forEach((value, key) => {
			nfoObject[key as keyof SeasonNFO] = value as string;
		});
		try {
			mkdirSync(`../storage/video/${params.showFolder}/Season ${seasonNum.padStart(2, '0')}`);
			return writeMetadata(
				'season',
				nfoObject,
				params.showFolder,
				`Season ${seasonNum.padStart(2, '0')}`
			);
		} catch (e) {
			return {
				error: {
					title: 'Created Season failed',
					details: (e as { message: string }).message
				}
			};
		}
	},
	reorderSeason: async ({ request, params }) => {
		const data = await request.formData();
		const newOrder = (data.get('newOrder') as string).split(',').map((v) => parseInt(v));

		const rawFiles = readdirSync(`../storage/video/${params.showFolder}`, { withFileTypes: true });
		const filteredFiles = rawFiles.filter((v) => v.isDirectory());

		const swaps = filteredFiles
			.map((_, i) => [newOrder[i].toString(), (i + 1).toString()])
			.filter(([a, b]) => a != b)
			.map(([a, b]) => [`Season ${a.padStart(2, '0')}`, `Season ${b.padStart(2, '0')}`]);
		try {
			swaps.forEach(([from, to]) => {
				renameSync(
					`../storage/video/${params.showFolder}/${from}`,
					`../storage/video/${params.showFolder}/${to} tmp`
				);
			});
			swaps.forEach((name) => {
				renameSync(
					`../storage/video/${params.showFolder}/${name[1]} tmp`,
					`../storage/video/${params.showFolder}/${name[1]}`
				);
				writeMetadata(
					'season',
					{ seasonnumber: parseInt(name[1].split(' ')[1]).toString() },
					params.showFolder,
					name[1]
				);
			});
		} catch (e) {
			return {
				error: {
					title: 'Reordering Failed!',
					details: (e as { message: string }).message
				}
			};
		}

		return {
			success: {
				title: 'Reordering Done!',
				details: ''
			}
		};
	}
};
