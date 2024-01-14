import { spawn } from 'child_process';

export function run() {
	console.log('Running Channellist');
	spawn('python3', [
		'/app/downloader/channellistRunner.py',
	]);
}
