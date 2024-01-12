import { validYtURL } from '$lib/helper';
import { appendFileSync } from 'fs';

/**
 *
 * @param YoutubeURL
 * @returns false if url is not a youtube url
 */
export const appendWaitlist = (YoutubeURL: string) => {
	if (validYtURL(YoutubeURL)) {
		appendFileSync('./data/waitlist.txt', YoutubeURL + '\n');
		return true;
	}
	return false;
};
