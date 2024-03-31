export function formatSize(KiloBytes: number) {
	const megaBytes = KiloBytes / 1000;
	if (megaBytes < 1024) return `${megaBytes}MB`;
	return `${(megaBytes / 1024).toFixed(2)}GB`;
}

export function formatDuration(
	seconds: number,
	differenceSinceNow: boolean = false,
	shortFormat: boolean = false
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

export function overlapObjects<T extends object>(o1: T, o2: Partial<T>): T {
	const ob = { ...o1 };

	for (const [key, value] of Object.entries(o2)) {
		if (value != undefined && value != null) {
			(ob as Record<string, unknown>)[key] = value;
		}
	}

	return ob;
}
