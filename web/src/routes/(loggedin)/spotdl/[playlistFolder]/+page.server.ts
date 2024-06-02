import { musicMetadataFormatter } from '$lib/frontendUtil';
import { downloadSong } from '$lib/tasks/tasks.js';
import { createReadStream, readdirSync, rmSync, writeFileSync } from 'fs';
import { parseStream } from 'music-metadata';

export const load = async ({ params }) => {
	const rawSongs = readdirSync(`../storage/music/${params.playlistFolder}`, {
		withFileTypes: true
	})
		.filter((v) => v.isFile() && v.name.endsWith('mp3'))
		.map((v) => v);

	const mappedSongs = rawSongs.map(async (song) => {
		const metadata = {
			title: song.name,
			artists: '',
			date: musicMetadataFormatter(new Date(0)),
			location: song.name
		};

		try {
			const parsed = await parseStream(
				createReadStream(`../storage/music/${params.playlistFolder}/${song.name}`),
				'audio/mp3'
			);
			metadata.title = parsed.common.title as string;
			metadata.artists = (parsed.common.artists || []).join(', ');
			metadata.date = parsed.common.date as string;
		} catch {
			/* empty */
		}

		return metadata;
	});
	return { songs: await Promise.all(mappedSongs), playlist: params.playlistFolder };
};

export const actions = {
	downloadSong,
	updateLyrics: async ({ request, params }) => {
		const data = await request.formData();
		const path = data.get('path') as string;
		const lyrics = data.get('lyrics') as string;

		const splittedFile = path.split('.');
		splittedFile.pop();
		const fileName = splittedFile.join('.');
		try {
			writeFileSync(`../storage/music/${params.playlistFolder}/${fileName}.lrc`, lyrics);
			return {
				success: {
					title: 'Updated Lyrics!',
					details: ''
				}
			};
		} catch {
			return {
				error: {
					title: 'Failed',
					details: ''
				}
			};
		}
	},
	deleteSong: async ({ request, params }) => {
		const data = await request.formData();
		const path = data.get('path') as string;

		try {
			rmSync(`../storage/music/${params.playlistFolder}/${path}`);
			const splittedFile = path.split('.');
			splittedFile.pop();
			const fileName = splittedFile.join('.');
			rmSync(`../storage/music/${params.playlistFolder}/${fileName}.lrc`);

			return {
				success: {
					title: 'Song Deleted',
					details: ''
				}
			};
		} catch (e) {
			return {
				error: {
					title: 'Delete Failed',
					details: (e as { message: string }).message
				}
			};
		}
	}
};
