export const NFODateFormatter = (d: Date) => {
	const year = d.getFullYear();
	const month = d.getMonth().toString().padStart(2, '0');
	const day = d.getDate().toString().padStart(2, '0');

	const hour = d.getHours().toString().padStart(2, '0');
	const minute = d.getMinutes().toString().padStart(2, '0');
	const second = d.getSeconds().toString().padStart(2, '0');

	return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};
export const musicMetadataFormatter = (d: Date) => {
	const year = d.getFullYear();
	const month = d.getMonth().toString().padStart(2, '0');
	const day = d.getDate().toString().padStart(2, '0');
	return `${year}-${month}-${day}`;
};

export const onlyAscii = (e: { key: string; ctrlKey: boolean; preventDefault: () => void }) =>
	e.ctrlKey ||
	e.key == 'Backspace' ||
	e.key == 'Enter' ||
	e.key.startsWith('Arrow') ||
	'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890 .,_-+*!?/\\:;`´"\'=()[]{}@'.includes(e.key.toUpperCase())
		? null
		: e.preventDefault();
export const onlyNumbers = (e: { key: string; ctrlKey: boolean; preventDefault: () => void }) =>
	e.ctrlKey ||
	e.key == 'Backspace' ||
	e.key == 'Enter' ||
	e.key.startsWith('Arrow') ||
	'1234567890'.includes(e.key)
		? null
		: e.preventDefault();

export function replaceAt(string: string, index: number, replacement: string) {
	return string.substring(0, index) + replacement + string.substring(index + replacement.length);
}

export const titleToFolderName = (title: string) => title.replaceAll(' ', '-');

export function humanFileSize(size: number) {
	const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
	return +(size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

export function overwriteObject<T extends object>(original: T, overwrite: Partial<T>): T {
	Object.entries(overwrite).forEach(([key, value]) => {
		// @ts-expect-error its ok
		original[key] = value;
	});

	return original;
}
