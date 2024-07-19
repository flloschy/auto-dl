import { limitArrayLengthToX, removeNonAsciiRegex, sortWithLevenshtein } from '$lib/utility';
import fs from 'node:fs';

export function folderCreateAutocomplete(location: string, typed: string) {
	const cleaned = typed.trim().replaceAll(' ', '_').replaceAll(removeNonAsciiRegex, '');
	let autocomplete = cleaned;
	let count = 0;
	while (fs.readdirSync(`./downloads/${location}`).includes(autocomplete)) {
		autocomplete = `${count++}_${cleaned}`;
	}
	autocomplete = autocomplete.slice(0, 25);
	return [autocomplete];
}
export function folderListAutocomplete(location: string, typed: string) {
	return limitArrayLengthToX(
		sortWithLevenshtein(
			fs
				.readdirSync(`./downloads/${location}`, { withFileTypes: true })
				.filter((dir) => dir.isDirectory())
				.map((dir) => dir.name),
			typed
		),
		10
	);
}
