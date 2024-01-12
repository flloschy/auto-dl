import { readFileSync, writeFileSync } from 'fs';
export const getWaitlist = () =>
	readFileSync('./data/waitlist.txt', { encoding: 'utf-8' }).split('\n');

export const setWaitlist = (lines: string[]) => {
	writeFileSync('./data/waitlist.txt', lines.join('\n'));
	return true;
};
