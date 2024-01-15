export const minuteInSeconds = 60;
export const hourInSeconds = minuteInSeconds * 60;
export const dayInSeconds = hourInSeconds * 24;

export const minAutoIntervalSeconds = minuteInSeconds * 30;
export const maxAutoIntervalSeconds = dayInSeconds * 7;
export const stepsAutoInterval = hourInSeconds / 2;

export const minWaitlistIntervalSeconds = minAutoIntervalSeconds;
export const maxWaitlistIntervalSeconds = maxAutoIntervalSeconds;
export const stepsWaitlistInterval = stepsAutoInterval;

export function formatSize(megaBytes: number) {
	if (megaBytes < 1024) return `${megaBytes}MB`;
	return `${(megaBytes / 1024).toFixed(2)}GB`;
}

export function sleep(milliseconds: number) {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export function validYtURL(youtubeURL: string) {
	// https://stackoverflow.com/questions/19377262/regex-for-youtube-url
	const ytUrlRegex =
		/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|live\/|v\/)?)([\w-]+)(\S+)?$/gim;
	return youtubeURL.match(ytUrlRegex);
}

export function genId(existingIds: string[]) {
	let idToTest = '';
	do {
		idToTest = Math.random().toString(36).substring(2, 15);
	} while (existingIds.includes(idToTest));
	return idToTest;
}

export function getNextAvailableNum(existingNums: number[]) {
    let numToTest = 1;
    while (existingNums.includes(numToTest)) numToTest++;
    return numToTest;
}

export function formatDuration(
	seconds: number,
	differenceSinceNow: boolean = false,
	shortFormat: boolean = false,
) {
	if (differenceSinceNow) {
		if (seconds == -1) return 'never';
		seconds = ~~(Date.now() / 1000) - seconds;
	}

	const weeks = Math.floor(seconds / (3600 * 24 * 7));
	seconds -= weeks * 3600 * 24 * 7;
	const days = Math.floor(seconds / (3600 * 24));
	seconds -= days * 3600 * 24;
	const hours = Math.floor(seconds / 3600);
	seconds -= hours * 3600;
	const minutes = Math.floor(seconds / 60);
	seconds -= minutes * 60;
	let result = '';
	if (weeks > 0) {
		result += weeks + 'w ';
		if (shortFormat) return result;
	}
	if (days > 0) {
		result += days + 'd ';
		if (shortFormat) return result;
	}
	if (hours > 0) {
		result += hours + 'h ';
		if (shortFormat) return result;
	}
	if (minutes > 0) {
		result += minutes + 'min ';
		if (shortFormat) return result;
	}
	if (seconds > 0) {
		result += seconds.toFixed(0) + 's ';
		if (shortFormat) return result;
	}
	if (!result) return '0s';
	return result;
}
