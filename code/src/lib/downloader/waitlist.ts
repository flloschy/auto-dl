import { spawn } from 'child_process';

export function run() {
	console.log('Running Waitlist');
	spawn('D:/python11/python.exe', [
		'c:/Users/flosc/OneDrive/Desktop/autodl2/downloader/waitlistRunner.py',
	]);
}
