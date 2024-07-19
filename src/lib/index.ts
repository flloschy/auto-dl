import type { ExecutionHandler } from './commandManager/commandLib/Execution';
import { execSync, spawn } from 'child_process';
import { getPlaylistIdFromYoutubeUrl, getVideoIdFromYoutubeUrl, humanFileSize } from './utility';
import { messageColors } from './commandManager/commandLib/UtilityTypes';

export async function getDuration(path: string) {
	try {
		const runtime = execSync(
			'ffprobe ' +
				[
					'-i',
					`"./downloads/${path}"`,
					'-show_entries',
					'format=duration',
					'-v',
					'quiet',
					'-of',
					'csv="p=0"'
				].join(' ')
		);
		const time = new Date(0);
		time.setSeconds(parseFloat(runtime.toString()));
		return time.toISOString().substring(11, 19);
	} catch {
		return '00:00:00';
	}
}

async function getVideoTitle(id: string) {
	try {
		return (
			await (
				await fetch(
					`https://youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`
				)
			).json()
		).title as string;
	} catch {
		return '';
	}
}

export async function getYoutubePlaylistIds(playlistId: string) {
	return execSync(`yt-dlp --flat-playlist --print id "${playlistId}"`)
		.toString()
		.split('\n')
		.map((line) => line.trim())
		.filter((id) => id.length < 13)
		.filter((id) => id);
}

export async function downloadYoutubeVideo(
	handler: ExecutionHandler,
	show: string,
	season: string,
	link: string
) {
	const id = getVideoIdFromYoutubeUrl(link);
	if (!id) {
		handler.log([
			{ message: 'Error:', color: messageColors.red },
			'video',
			{ message: link, color: messageColors.cyan },
			'is not a valid youtube URL'
		]);
		return false;
	}

	const title = await getVideoTitle(id);

	if (title == '') return false;

	const params = [
		'-P', // Path
		`./downloads/video/${show}/${season}`,
		'--output', // File
		`[${id}]`,
		'--write-info-json',
		'--clean-info-json',
		'--progress-template', // output format
		`"%(progress.downloaded_bytes)s / %(progress.total_bytes_estimate)s"`,
		'--sponsorblock-mark',
		'all',
		'--write-info-json', // create info.json for youtube metadata
		'--progress', // send progress report
		'--newline', // dont replace last logged line
		'--embed-chapters',
		'--embed-metadata',
		'--quiet', // dont log anything else
		`https://youtu.be/${id}`
	].filter((x) => x != '');

	handler.log([
		{ message: `{${id}}`, color: messageColors.yellow },
		'command:',
		{ message: 'yt-dlp ' + params.join(' '), color: messageColors.blue }
	]);

	handler.log([
		{ message: `{${id}}`, color: messageColors.yellow },
		'(',
		{ message: `???`, color: messageColors.cyan },
		'/',
		{ message: `???`, color: messageColors.blue },
		')',
		{ message: '0%', color: messageColors.yellow }
	]);

	const result = await new Promise((resolve) => {
		const process = spawn('yt-dlp', params);
		let finished = false;

		process.stdout.on('data', (data) => {
			const stringData = data.toString() as string;
			const [current, total] = stringData.split(' / ');
			const numCurrent = parseInt(current);
			const numTotal = parseInt(total);
			const percent = numCurrent / numTotal;

			handler.log(
				[
					{ message: `{${id}}`, color: messageColors.yellow },
					'(',
					{ message: humanFileSize(numCurrent), color: messageColors.cyan },
					'/',
					{ message: humanFileSize(numTotal), color: messageColors.blue },
					')',
					{ message: `${Math.round(percent * 100)}%`, color: messageColors.yellow }
				],
				true
			);
			if (Math.round(percent * 100) == 100 && !finished && !isNaN(numCurrent) && !isNaN(numTotal)) {
				finished = true;
				handler.log([
					{ message: `{${id}}`, color: messageColors.yellow },
					'downloading',
					{ message: 'done', color: messageColors.green }
				]);
			}
		});
		// process.stderr.on('data', (data) => {
		//     handler.log([
		//         {message: `{${id}}`, color: messageColors.yellow},
		//         "downloading",
		//         {message: "failed", color: messageColors.red},
		//         ":",
		//         data.toString()
		//     ])
		//     reject(false);
		// });
		process.on('close', async () => {
			handler.log([
				{ message: `{${id}}`, color: messageColors.yellow },
				'recoding',
				{ message: 'done', color: messageColors.green }
			]);
			resolve(true);
		});
	});

	if (!result) return false;
	handler.log([
		{ message: `{${id}}`, color: messageColors.yellow },
		'video length: ',
		{ message: `${result}`, color: messageColors.cyan }
	]);

	return { filename: `[${id}]`, videoTitle: title };
}
export async function downloadYoutubeVideoPlaylist(
	handler: ExecutionHandler,
	show: string,
	season: string,
	link: string
) {
	const playlistId = getPlaylistIdFromYoutubeUrl(link);
	if (!playlistId) {
		handler.log(['failed to get playlist id']);
		return;
	}
	const ids = await getYoutubePlaylistIds(playlistId);
	const files: { filename: string; videoTitle: string }[] = [];

	for (let index = 0; index < ids.length; index++) {
		const id = ids[index];
		const out = await downloadYoutubeVideo(handler, show, season, `https://youtu.be/${id}`);
		if (out) {
			files.push(out);
		}
	}

	return files;
}

export async function downloadSpotifySong(
	handler: ExecutionHandler,
	playlist: string,
	spotify: string,
	youtube?: string
) {
	handler.log([
		'downloading',
		{ message: `${spotify}${youtube ? '|' + youtube : ''}`, color: messageColors.cyan },
		'to',
		{ message: playlist, color: messageColors.cyan },
		'...'
	]);

	return await new Promise((resolve) => {
		const process = spawn(
			'spotdl',
			[
				'download',
				`${spotify}${youtube ? '|' + youtube : ''}`,
				'--restrict',
				'ascii',
				'--generate-lrc',
				'--threads',
				'1',
				'--format',
				'mp3',
				'--preload'
			],
			{
				cwd: `./downloads/music/${playlist}`
			}
		);
		process.stderr.on('data', (data) => {
			handler.log([{ message: 'Error:', color: messageColors.red }, data.toString()]);
			resolve(false);
		});
		process.on('close', () => {
			handler.log(
				[
					{ message: 'done', color: messageColors.green },
					'downloading',
					{ message: `${spotify}${youtube ? ':' + youtube : ''}`, color: messageColors.cyan },
					'to',
					{ message: playlist, color: messageColors.cyan }
				],
				true
			);
			resolve(true);
		});
		process.on('error', (e) => {
			handler.log([{ message: 'Error:', color: messageColors.red }, e.toString()]);
			resolve(false);
		});
	});
}

export async function downloadSpotifyPlaylist(
	handler: ExecutionHandler,
	playlist: string,
	spotify: string
) {
	return await downloadSpotifySong(handler, playlist, spotify);
}

export async function downloadYoutubeSong<T extends 'podcast' | 'music'>(
	handler: ExecutionHandler,
	playlist: string,
	link: string,
	type: T,
	infoJson: boolean = true
) {
	const id = getVideoIdFromYoutubeUrl(link);
	if (!id) {
		handler.log([
			{ message: 'Error:', color: messageColors.red },
			'video',
			{ message: link, color: messageColors.cyan },
			'is not a valid youtube URL'
		]);
		return false;
	}

	const title = await getVideoTitle(id);

	if (title == '') return false;

	const params = [
		'-P', // Path
		`./downloads/${type}/${playlist}`,
		'--output', // File
		`[${id}]`,
		'-f', // Format
		`ba`, // best audio
		infoJson ? '--write-info-json' : '',
		infoJson ? '--clean-info-json' : '',
		'--progress-template', // output format
		`%(progress.downloaded_bytes)s / %(progress.total_bytes)s`,
		'--sponsorblock-mark',
		'all',
		// '--write-info-json', // create info.json for youtube metadata
		'--progress', // send progress report
		'--newline', // dont replace last logged line
		// '--embed-chapters',
		'--embed-metadata',
		'--quiet', // dont log anything else
		'-x', // extract audio
		'--audio-format',
		'mp3', // reformat to mp3
		`https://youtu.be/${id}`
	].filter((x) => x != '');

	handler.log([
		{ message: `(audio) {${id}}`, color: messageColors.yellow },
		'(',
		{ message: `???`, color: messageColors.cyan },
		'/',
		{ message: `???`, color: messageColors.blue },
		')',
		{ message: '0%', color: messageColors.yellow }
	]);

	const result = await new Promise((resolve) => {
		let finished = false;
		const process = spawn('yt-dlp', params);
		process.stdout.on('data', (data) => {
			const stringData = data.toString() as string;
			const [current, total] = stringData.split(' / ');
			const numCurrent = parseInt(current);
			const numTotal = parseInt(total);
			const percent = numCurrent / numTotal;

			handler.log(
				[
					{ message: `(audio) {${id}}`, color: messageColors.yellow },
					'(',
					{ message: humanFileSize(numCurrent), color: messageColors.cyan },
					'/',
					{ message: humanFileSize(numTotal), color: messageColors.blue },
					')',
					{ message: `${Math.round(percent * 100)}%`, color: messageColors.yellow }
				],
				true
			);
			if (Math.round(percent * 100) == 100 && !finished) {
				finished = true;
				handler.log([
					{ message: `(audio) {${id}}`, color: messageColors.yellow },
					'downloading',
					{ message: 'done', color: messageColors.green }
				]);
				handler.log([
					{ message: `(audio) {${id}}`, color: messageColors.yellow },
					'recoding audio to mp3',
					{ message: 'This process does not have progress reporting', color: messageColors.white }
				]);
			}
		});
		process.stderr.on('data', (data) => {
			handler.log([
				{ message: `(audio) {${id}}`, color: messageColors.yellow },
				'downloading',
				{ message: 'failed', color: messageColors.red },
				':',
				data.toString()
			]);
			resolve(false);
		});
		process.on('close', async () => {
			handler.log([
				{ message: `(audio) {${id}}`, color: messageColors.yellow },
				'recoding',
				{ message: 'done', color: messageColors.green }
			]);
			resolve(true);
		});
	});
	if (type == 'music') {
		return !!result;
	}
	if (!result) {
		return false;
	}

	return {
		filename: `[${id}].mp3`,
		videoTitle: title
	};
}
