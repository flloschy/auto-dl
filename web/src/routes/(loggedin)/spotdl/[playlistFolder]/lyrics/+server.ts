import { readFileSync } from 'fs';

export const GET = async ({ params, url }) => {
	const path = url.searchParams.get('path');
	if (!path) return new Response(undefined, { status: 404 });

	const splittedFile = path.split('.');
	splittedFile.pop();
	const fileName = splittedFile.join('.');

	try {
		return new Response(
			readFileSync(`../storage/music/${params.playlistFolder}/${fileName}.lrc`).toString()
		);
	} catch {
		return new Response('');
	}
};
