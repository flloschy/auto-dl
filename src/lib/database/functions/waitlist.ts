const filePath = 'src/lib/database/functions/waitlist.ts';

import { waitlist } from '../tables/waitlist';
import { logDebug, logInfo } from './logs';

export function getWaitlist() {
	return waitlist.keyArray();
}
export function remWaitlist(videoId: string) {
	logDebug('removed from waitlist', videoId, filePath, 'remWaitlist');
	return waitlist.delete(videoId);
}
export function addWaitlist(videoId: string) {
	logInfo('added to waitlist', videoId, filePath, 'addWaitlist');
	waitlist.set(videoId, videoId);
}
export function countWaitlist() {
	return waitlist.size;
}
