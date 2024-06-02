import { readdirSync, rmSync } from 'fs';
import { pushTask, removeTask } from './taskManager';
import { getMetadata, writeMetadata } from '$lib';
import type { Action } from '@sveltejs/kit';
import { broadcast } from '$lib/broadcaster';
import { execSync, spawn } from 'node:child_process';
import { NFODateFormatter, humanFileSize } from '$lib/frontendUtil';
import type { EpisodeNFO, SeasonNFO, ShowNFO } from '$lib/types';
async function downloadFromYoutube(
	folder1: string,
	folder2: string,
	id: string,
	progressReport: (percent: number, currentSize: string, totalSize: string) => void,
	audioOnly: boolean = false
) {
	return await new Promise((resolve, reject) => {
		const process = spawn(
			'ytdlp',
			[
				'-P',
				`../storage/video/${folder1}/${folder2 == '' ? folder2 + '/' : ''}`,
				'--output',
				`[${id}]`,
				'-f',
				audioOnly ? `ba[ext=mp3]` : `bestvideo[ext=webm]+bestaudio[ext=webm]/best[ext=webm]/best`,
				'--progress-template',
				`%(progress.downloaded_bytes)s / %(progress.total_bytes)s`,
				'--sponsorblock-mark',
				'all',
				'--sponsorblock-remove',
				'sponsor',
				'--clean-info-json',
				'--progress',
				'--newline',
				'--embed-chapters',
				'--embed-metadata',
				'--quiet',
				audioOnly ? '--extract-audio' : '',
				`https://youtu.be/${id}`
			].filter((i) => i != '')
		);
		process.stdout.on('data', (data) => {
			const stringData = data.toString() as string;
			const [current, total] = stringData.split(' / ');
			const numCurrent = parseInt(current);
			const numTotal = parseInt(total);
			const percent = numCurrent / numTotal;

			progressReport(percent, humanFileSize(numCurrent), humanFileSize(numTotal));
		});
		process.stderr.on('data', (data) => {
			reject(data.toString());
		});
		process.on('close', () => {
			const runtime = parseFloat(
				execSync(
					`ffprobe -i "../storage/podcast/${folder1}/${folder2 == '' ? folder2 + '/' : ''}/[${id}].${audioOnly ? 'mp3' : 'web'} -show_entries format=duration -v quiet -of csv="p=0"`
				).toString()
			).toString();

			resolve(runtime);
		});
	});
}

async function downloadFromSpotify(url: string, path: string, sync: boolean = false) {
	return await new Promise((resolve, reject) => {
		const process = spawn(
			'spotdl',
			[
				sync ? 'sync' : 'download',
				url,
				'--restrict',
				'ascii',
				'--generate-lrc',
				'--threads',
				'1',
				'--format',
				'mp3',
				'--save-file',
				'album.spotdl',
				'--preload',
				'--sync-without-deleting'
			],
			{
				cwd: `../storage/music/${path}`
			}
		);
		process.stderr.on('data', (data) => {
			reject(data.toString());
		});
		process.on('close', resolve);
		process.on('error', (e) => reject(e));
	});
}

async function getTitle(id: string) {
	try {
		return (
			await (
				await fetch(
					`https://youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`
				)
			).json()
		).title;
	} catch {
		return '';
	}
}

export const fixNFO: Action = async ({ request }) => {
	const data = await request.formData();
	const toastId = data.get('toastId') as string;

	const operations: {
		type: 'show' | 'season' | 'episode' | 'album' | 'podcast' | 'podcastEpisode';
		show: string;
		season?: string;
		episode?: string;
	}[] = [];
	pushTask(
		'Creating missing NFO',
		async (task) => {
			task.status.update((s) => ({
				...s,
				process: "system",
				detail: 'Reading tasks',
				toastId
			}));
			readdirSync(`../storage/video/`, { withFileTypes: true }).forEach((show) => {
				if (!show.isDirectory()) return;
				operations.push({
					type: 'show',
					show: show.name
				});
				readdirSync(`../storage/video/${show.name}/`, { withFileTypes: true }).forEach((season) => {
					if (!season.isDirectory()) return;
					operations.push({
						type: 'season',
						show: show.name,
						season: season.name
					});
					readdirSync(`../storage/video/${show.name}/${season.name}`, {
						withFileTypes: true
					}).forEach((episode) => {
						if (!episode.isFile()) return;
						if (episode.name.endsWith('nfo') || episode.name.endsWith('part')) return;
						operations.push({
							type: 'episode',
							show: show.name,
							season: season.name,
							episode: episode.name
						});
					});
				});
			});
			readdirSync(`../storage/podcast`, { withFileTypes: true }).forEach((podcast) => {
				if (!podcast.isDirectory()) return;
				operations.push({
					type: 'podcast',
					show: podcast.name
				});
				readdirSync(`../storage/podcast/${podcast.name}`, { withFileTypes: true }).forEach(
					(episode) => {
						if (!podcast.isFile()) return;
						operations.push({
							type: 'podcastEpisode',
							show: podcast.name,
							season: episode.name
						});
					}
				);
			});
			readdirSync(`../storage/music`, { withFileTypes: true }).forEach((album) => {
				if (!album.isDirectory()) return;
				operations.push({
					type: 'album',
					show: album.name
				});
			});

			return true;
		},
		async (task) => {
			for (let i = 0; i < operations.length; i++) {
				const operation = operations[i];
				task.status.update((s) => ({
					...s,
					progress: (i + 1) / operations.length,
					detail: `Working on ${operation.show}${operation.season ? '/' + operation.season : ''}${operation.episode ? '/' + operation.episode : ''}`
				}));

				const overwrite: Partial<EpisodeNFO | SeasonNFO | ShowNFO> = {};
				if (operation.type == 'episode' || operation.type == 'podcastEpisode') {
					try {
						const nfo = getMetadata('episode', operation.show, operation.season, operation.episode);
						const title = await getTitle(nfo.youtubemetadataid);
						overwrite.title = title;
					} catch {
						/* empty */
					}
				}
				writeMetadata(
					operation.type,
					overwrite,
					operation.show,
					operation.season,
					operation.episode
				);
				await new Promise((resolve) => setTimeout(resolve, 300));
			}
			task.status.update((s) => ({
				...s,
				state: 'done',
				finished: Date.now()
			}));
		}
	);
};

export const deleteTask: Action = async ({ request }) => {
	const data = await request.formData();
	const toastId = data.get('toastId') as string;
	const id = data.get('id') as string;
	if (removeTask(id))
		broadcast({
			toastUpdate: {
				id: toastId,
				title: 'Task Deleted',
				description: '',
				type: 'success'
			}
		});
	else
		broadcast({
			toastUpdate: {
				id: toastId,
				title: 'Task not Deleted',
				description: "Either the task doesn't exist anymore or it is running",
				type: 'error'
			}
		});
};

export const downloadYoutubeVideo: Action = async ({ request, params }) => {
	const data = await request.formData();
	const toastId = data.get('toastId') as string;
	const youtubemetadataid = data.get('youtubemetadataid') as string;
	let title: string;

	pushTask(
		'Downloading',
		async (task) => {
			task.status.update((s) => ({
				...s,
				process: 'yt',
				toastId
			}));
			try {
				title = await getTitle(youtubemetadataid);
			} catch (e) {
				task.status.update((s) => ({
					...s,
					finished: Date.now(),
					detail: (e as { message: string }).message,
					title: 'Downloading Failed',
					state: 'error'
				}));
			}

			task.status.update((s) => ({
				...s,
				process: 'yt',
				title: 'Downloading ' + youtubemetadataid
			}));

			return true;
		},
		async (task) => {
			await downloadFromYoutube(
				params.showFolder as string,
				params.seasonFolder as string,
				youtubemetadataid,
				(percent, current, total) => {
					task.status.update((s) => ({
						...s,
						progress: percent,
						detail: `${current} of ${total} | ${title}`
					}));
				},
				false
			)
				.then((runtime) => {
					task.status.update((s) => ({
						...s,
						state: 'running',
						detail: 'Writing Metadata',
						progress: 0
					}));

					writeMetadata(
						'episode',
						{
							title,
							dateadded: NFODateFormatter(new Date()),
							originaltitle: title,
							youtubemetadataid,
							runtime: runtime as string
						},
						params.showFolder as string,
						params.seasonFolder as string,
						`[${youtubemetadataid}].webm`
					);

					task.status.update((s) => ({
						...s,
						finished: Date.now(),
						progress: 1,
						state: 'done',
						detail: 'Finished'
					}));
				})
				.catch((e) => {
					task.status.update((s) => ({
						...s,
						finished: Date.now(),
						state: 'error',
						detail: e.toString()
					}));
				});
		}
	);
};

export const downloadYoutubePlaylist: Action = async ({ request, params }) => {
	const data = await request.formData();
	const toastId = data.get('toastId') as string;
	const playlistId = data.get('playlistId') as string;

	let ids: string[];
	pushTask(
		'Downloading Playlist',
		async (task) => {
			task.status.update((s) => ({
				...s,
				detail: 'Retrieving Videos Ids',
				toastId,
				process: 'yt'
			}));
			try {
				const output = execSync(`yt-dlp --flat-playlist --print id "${playlistId}"`).toString();
				ids = output
					.split('\n')
					.map((line) => line.trim())
					.filter((id) => id);
			} catch {
				return false;
			}

			return true;
		},
		async (task) => {
			task.status.update((s) => ({
				...s,
				detail: '--/-- | -- of -- | Lorem ipsum dolor sit. | (-- failed)'
			}));
			let failed = 0;
			for (let i = 0; i < ids.length; i++) {
				const id = ids[i];
				const title = await getTitle(id);

				task.status.update((s) => ({
					...s,
					detail: `${i + 1}/${ids.length} | -- of -- | ${title} | (${failed} failed)`
				}));

				await downloadFromYoutube(
					params.showFolder as string,
					params.seasonFolder as string,
					id,
					(percent, current, total) => {
						task.status.update((s) => ({
							...s,
							detail: `${i + 1}/${ids.length} | ${current} of ${total} | ${title} | (${failed} failed)`
						}));
					},
					false
				)
					.then((runtime) => {
						task.status.update((s) => ({
							...s,
							state: 'running',
							detail: `${i + 1}/${ids.length} | Writing Metadata | ${title} | (${failed} failed)`,
							progress: 0
						}));

						writeMetadata(
							'episode',
							{
								title,
								dateadded: NFODateFormatter(new Date()),
								originaltitle: title,
								youtubemetadataid: id,
								runtime: runtime as string
							},
							params.showFolder as string,
							params.seasonFolder as string,
							`[${id}].webm`
						);

						task.status.update((s) => ({
							...s,
							progress: 1
						}));
					})
					.catch(() => failed++);
			}

			task.status.update((s) => ({
				...s,
				detail: `Downloaded ${ids.length} Videos`,
				finished: Date.now(),
				state: 'done',
				progress: 1
			}));
		}
	);
};

export const replaceNFO: Action = async ({ request }) => {
	const data = await request.formData();
	const toastId = data.get('toastId') as string;

	const paths: string[] = [];

	pushTask(
		'Removing all NFO',
		async (task) => {
			task.status.update((s) => ({
				...s,
				process: "system",
				detail: 'Reading tasks',
				toastId
			}));
			readdirSync(`../storage/video/`, { withFileTypes: true }).forEach((show) => {
				if (!show.isDirectory()) return;
				paths.push(`../storage/video/${show.name}/tvshow.nfo`);
				readdirSync(`../storage/video/${show.name}/`, { withFileTypes: true }).forEach((season) => {
					if (!season.isDirectory()) return;
					paths.push(`../storage/video/${show.name}/${season.name}/season.nfo`);
					readdirSync(`../storage/video/${show.name}/${season.name}`, {
						withFileTypes: true
					}).forEach((episode) => {
						if (!episode.isFile()) return;
						if (episode.name.endsWith('nfo') || episode.name.endsWith('part')) return;
						const splittedFilename = (episode.name as string).split('.');
						splittedFilename.pop();
						const fileName = splittedFilename.join();
						paths.push(`../storage/video/${show.name}/${season.name}/${fileName}.nfo`);
					});
				});
			});
			readdirSync(`../storage/podcast`, { withFileTypes: true }).forEach((podcast) => {
				if (!podcast.isDirectory()) return;
				paths.push(`../storage/podcast/${podcast.name}/album.nfo`)
				readdirSync(`../storage/podcast/${podcast.name}`, { withFileTypes: true }).forEach(
					(episode) => {
						if (!podcast.isFile()) return;
						const splittedFilename = (episode.name as string).split('.');
						splittedFilename.pop();
						const fileName = splittedFilename.join();
						paths.push(`../storage/podcast/${podcast.name}/${fileName}.nfo`)
					}
				);
			});
			readdirSync(`../storage/music`, { withFileTypes: true }).forEach((album) => {
				if (!album.isDirectory()) return;
				paths.push(`../storage/music/${album.name}/album.nfo`)
			});
			return true;
		},
		async (task) => {
			for (let i = 0; i < paths.length; i++) {
				const file = paths[i];
				task.status.update((s) => ({
					...s,
					progress: (i + 1) / paths.length,
					detail: `(${i + 1} / ${paths.length}) Working on ${file}`
				}));
				try {
					rmSync(file);
				} catch {
					/* empty */
				}
				await new Promise((resolve) => setTimeout(resolve, 200));
			}

			task.status.update((s) => ({
				...s,
				state: 'done',
				finished: Date.now(),
				detail: ''
			}));

			const formData = new FormData();
			formData.set('toastId', toastId);
			// @ts-expect-error this is okay
			fixNFO({ request: { formData: () => formData } });
		}
	);
};

export const downloadSong: Action = async ({ request, params }) => {
	const data = await request.formData();
	const toastId = data.get('toastId');
	const youtube = data.get('youtube');
	const spotify = data.get('spotify') as string;

	pushTask(
		'Downloading song',
		async (task) => {
			task.status.update((s) => ({
				...s,
				toastId: toastId as string,
				process: 'audio',
				progress: 0,
				detail: "<Progress Report doesn't exist>"
			}));
			return true;
		},
		async (task) => {
			await downloadFromSpotify(
				(youtube ? (youtube as string) + '|' : '') + spotify,
				params.playlistFolder as string,
				false
			)
				.then(() => {
					task.status.update((s) => ({
						...s,
						detail: 'done',
						progress: 1,
						finished: Date.now(),
						state: 'done'
					}));
				})
				.catch((error) => {
					task.status.update((s) => ({
						...s,
						detail: error,
						progress: 1,
						finished: Date.now(),
						state: 'error'
					}));
				});
		}
	);
};

export const syncPlaylist: Action = async ({ request }) => {
	const data = await request.formData();
	const toastId = data.get('toastId');
	const path = data.get('path');
	const spotify = data.get('spotify') as string;

	pushTask(
		'Syncing Playlist',
		async (task) => {
			task.status.update((s) => ({
				...s,
				toastId: toastId as string,
				process: 'audio',
				progress: 0,
				detail: "<Progress Report doesn't exist>"
			}));
			return true;
		},
		async (task) => {
			await downloadFromSpotify(spotify, path as string, true)
				.then(() => {
					task.status.update((s) => ({
						...s,
						detail: 'done',
						progress: 1,
						finished: Date.now(),
						state: 'done'
					}));
				})
				.catch((error) => {
					task.status.update((s) => ({
						...s,
						detail: error,
						progress: 1,
						finished: Date.now(),
						state: 'error'
					}));
				});
		}
	);
};

export const syncAll: Action = async ({ request }) => {
	const data = await request.formData();
	const toastId = data.get('toastId') as string;

	pushTask(
		'Syncing all Playlists',
		async (task) => {
			task.status.update((s) => ({
				...s,
				process: 'audio',
				toastId
			}));
			return true;
		},
		async (task) => {
			const rawPlaylists = readdirSync('../storage/music', { withFileTypes: true });
			const filteredPlaylist = rawPlaylists.filter((v) => v.isDirectory());
			const metadata = filteredPlaylist.map((v) => ({
				path: v.name,
				url: getMetadata('album', v.name).plot
			}));
			const filteredMetadata = metadata.filter((v) => v.url != '');

			const processes: { path: string; url: string }[] = filteredMetadata;
			let failed = 0;

			for (let i = 0; i < processes.length; i++) {
				task.status.update((s) => ({
					...s,
					detail: `${i} / ${processes.length} | (${failed} failed)`,
					progress: i / processes.length
				}));

				await downloadFromSpotify(processes[i].url, processes[i].path, true)
					.then(() => {})
					.catch((e) => {
						failed++;
					});
			}
			task.status.update((s) => ({
				...s,
				finished: Date.now(),
				progress: 1,
				detail: `${processes.length} / ${processes.length} | (${failed} failed)`,
				state: 'done'
			}));
		}
	);
};

export const downloadPodcastVideo: Action = async ({ request, params }) => {
	const data = await request.formData();
	const toastId = data.get('toastId') as string;
	const youtubemetadataid = data.get('youtubemetadataid') as string;
	let title: string;

	pushTask(
		'Downloading',
		async (task) => {
			task.status.update((s) => ({
				...s,
				process: 'audio',
				toastId
			}));
			try {
				title = await getTitle(youtubemetadataid);
			} catch (e) {
				task.status.update((s) => ({
					...s,
					finished: Date.now(),
					detail: (e as { message: string }).message,
					title: 'Downloading Failed',
					state: 'error'
				}));
			}

			task.status.update((s) => ({
				...s,
				process: 'yt',
				title: 'Downloading ' + youtubemetadataid
			}));

			return true;
		},
		async (task) => {
			await downloadFromYoutube(
				params.podcastFolder as string,
				'',
				youtubemetadataid,
				(percent, current, total) => {
					task.status.update((s) => ({
						...s,
						progress: percent,
						detail: `${current} of ${total} | ${title}`
					}));
				},
				true
			)
				.then((runtime) => {
					task.status.update((s) => ({
						...s,
						state: 'running',
						detail: 'Writing Metadata',
						progress: 0
					}));

					writeMetadata(
						'podcastEpisode',
						{
							title,
							dateadded: NFODateFormatter(new Date()),
							originaltitle: title,
							youtubemetadataid,
							runtime: runtime as string
						},
						params.podcastFolder as string,
						`[${youtubemetadataid}].mp3`
					);

					task.status.update((s) => ({
						...s,
						finished: Date.now(),
						progress: 1,
						state: 'done',
						detail: 'Finished'
					}));
				})
				.catch((e) => {
					task.status.update((s) => ({
						...s,
						finished: Date.now(),
						state: 'error',
						detail: e.toString()
					}));
				});
		}
	);
};

export const downloadPodcastPlaylist: Action = async ({ request, params }) => {
	const data = await request.formData();
	const toastId = data.get('toastId') as string;
	const playlistId = data.get('playlistId') as string;

	let ids: string[];
	pushTask(
		'Downloading Playlist',
		async (task) => {
			task.status.update((s) => ({
				...s,
				detail: 'Retriving Videos Ids',
				toastId,
				process: 'yt'
			}));
			try {
				const output = execSync(`yt-dlp --flat-playlist --print id "${playlistId}"`).toString();
				ids = output
					.split('\n')
					.map((line) => line.trim())
					.filter((id) => id);
			} catch {
				return false;
			}

			return true;
		},
		async (task) => {
			task.status.update((s) => ({
				...s,
				detail: '--/-- | -- of -- | Lorem ipsum dolor sit. | (-- failed)'
			}));
			let failed = 0;
			for (let i = 0; i < ids.length; i++) {
				const id = ids[i];
				let title: string = '?';
				try {
					title = await getTitle(id);
				} catch {
					/* empty */
				}

				task.status.update((s) => ({
					...s,
					detail: `${i + 1}/${ids.length} | -- of -- | ${title} | (${failed} failed)`
				}));

				await downloadFromYoutube(
					params.podcastFolder as string,
					'',
					id,
					(progress, current, total) => {
						task.status.update((s) => ({
							...s,
							progress,
							detail: `${i + 1}/${ids.length} | ${current} of ${total} | Lorem ipsum dolor sit. | (${failed} failed)`
						}));
					},
					true
				)
					.then((runtime) => {
						task.status.update((s) => ({
							...s,
							state: 'running',
							detail: `${i + 1}/${ids.length} | Writing Metadata | ${title} | (${failed} failed)`,
							progress: 0
						}));

						writeMetadata(
							'podcastEpisode',
							{
								title,
								dateadded: NFODateFormatter(new Date()),
								originaltitle: title,
								youtubemetadataid: id,
								runtime: runtime as string
							},
							params.podcastEpisode as string,
							`[${id}].mp3`
						);

						task.status.update((s) => ({
							...s,
							progress: 1
						}));
					})
					.catch(() => failed++);
			}

			task.status.update((s) => ({
				...s,
				detail: `Downloaded ${ids.length} Episodes`,
				finished: Date.now(),
				state: 'done',
				progress: 1
			}));
		}
	);
};
