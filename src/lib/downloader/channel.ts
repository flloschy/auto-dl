import { getSettings } from '$lib/settings';
import { spawn } from 'child_process';

export function run() {
	console.log('Running Channellist');
	spawn(getSettings().pythonCommand, [
		'./downloader/channellistRunner.py',
	])
    .on('close', () => console.log("close"))
    .on('exit', () => console.log("exit"))
    .on('error', (e) => console.log(e))
    .on('disconnect', () => console.log("disconnect"))
    .on('message', (m) => console.log(m))
    .on('spawn', () => console.log("spawn"))
        
    
}
