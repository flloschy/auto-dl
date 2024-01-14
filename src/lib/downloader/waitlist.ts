import { getSettings } from '$lib/settings';
import { spawn } from 'child_process';

export function run() {
	console.log('Running Waitlist');
	spawn(getSettings().pythonCommand, [
		'./downloader/waitlistRunner.py',
	])
    .on('close', () => console.log("close"))
    .on('exit', () => console.log("exit"))
    .on('error', (e) => console.log(e))
    .on('disconnect', () => console.log("disconnect"))
    .on('message', (m) => console.log(m))
    .on('spawn', () => console.log("spawn"))
        
}
