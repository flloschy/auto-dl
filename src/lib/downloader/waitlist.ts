import { spawn } from 'child_process';

export function run() {
	console.log('Running Waitlist');
	spawn('python3', [
		'/app/downloader/waitlistRunner.py',
	]);
}
