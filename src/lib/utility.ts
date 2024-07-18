import { readdirSync, statSync } from "fs";

/**
 * @copyright https://gist.github.com/keesey/e09d0af833476385b9ee13b6d26a2b84
 */
export function levenshtein(a: string, b: string): number
{
	const an = a ? a.length : 0;
	const bn = b ? b.length : 0;
	if (an === 0)
	{
		return bn;
	}
	if (bn === 0)
	{
		return an;
	}
	const matrix = new Array<number[]>(bn + 1);
	for (let i = 0; i <= bn; ++i)
	{
		const row = matrix[i] = new Array<number>(an + 1);
		row[0] = i;
	}
	const firstRow = matrix[0];
	for (let j = 1; j <= an; ++j)
	{
		firstRow[j] = j;
	}
	for (let i = 1; i <= bn; ++i)
	{
		for (let j = 1; j <= an; ++j)
		{
			if (b.charAt(i - 1) === a.charAt(j - 1))
			{
				matrix[i][j] = matrix[i - 1][j - 1];
			}
			else
			{
				matrix[i][j] = Math.min(
					matrix[i - 1][j - 1], // substitution
					matrix[i][j - 1], // insertion
					matrix[i - 1][j] // deletion
				) + 1;
			}
		}
	}
	return matrix[bn][an];
};

export const sortWithLevenshtein = (list: string[], typed: string) => list.sort((a, b) => levenshtein(a, typed) - levenshtein(b, typed))
export const limitArrayLengthToX = (list: string[], limit: number) => list.slice(0, limit)

export const NFODateFormatter = (d: Date | number) => {
	if (typeof d == "number") {
		d = new Date(d)
	}
	const year = d.getFullYear();
	const month = d.getMonth().toString().padStart(2, '0');
	const day = d.getDate().toString().padStart(2, '0');

	const hour = d.getHours().toString().padStart(2, '0');
	const minute = d.getMinutes().toString().padStart(2, '0');
	const second = d.getSeconds().toString().padStart(2, '0');

	return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};
export const inRange = (x: number, min: number, max: number) => x <= max && x >= min
export const rangeToArray = (start:number, end:number) => Array.from({length: end-start}).map((_, i) => start + i)

export const removeNonAsciiRegex = /[^A-z0-9]/g

export function pathAge(path: string) {
	try {
		const stat = statSync(path)
		return stat.birthtimeMs;
	} catch {
		return Date.now()
	}
}
export function getFolderNumber(location: string) {
	const segments = location.split("/")
	const folder = segments.pop()
	const path = segments.join("/")


	const folders = readdirSync(path, {withFileTypes: true})
	const dirs = folders.filter(entry => entry.isDirectory())

	for (let index = 0; index < dirs.length; index++) {
		const dir = dirs[index];
		if (dir.name == folder) return index+1
	}

	return dirs.length
}

export function extractSectionsFromFile(location: string) {
	const segments = location.split("/")
	const file = segments.pop()?.split(".")
	const path = segments.join("/")
	const extension = file?.pop()
	const fileName = file?.join(".")

	return {
		path,
		extension,
		fileName
	}
}

export function cleanFlatObject(obj: object) {
	const newObj = {}

	Object.entries(obj).forEach(([key, value]) => {
		if (value == "") return
		if (value == null) return
		if (value == undefined) return
		newObj[key] = value
	})

	return newObj
}

export function clamp(x: number, min: number, max: number) {
	return Math.min(max, Math.max(min, x))
}

export function getVideoIdFromYoutubeUrl(link: string) {
	/**
	 * @copyright https://stackoverflow.com/a/27728417
	 */
	const rx = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|&v(?:i)?=))([^#&?]*).*/
	const matches = link.match(rx)
	if (!matches) return false
	const id = matches[1]
	if (!id) return false
	return id
}

export function getPlaylistIdFromYoutubeUrl(link: string) {
	return link.split("=").pop()
}

export function humanFileSize(size: number) {
	const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
	return +(size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

export function cleanName(name: string) {
	return name
		.trim()
		.replaceAll(" ", "_")
		.replaceAll(removeNonAsciiRegex, "")
		.slice(0, 20)
}
export function isCleaned(name: string) {
	return name == cleanName(name)
}