import { mkdirSync, readFileSync } from 'fs';
import { redirect } from '@sveltejs/kit';
import { encrypt } from '$lib';

const password = encrypt(readFileSync('../data/password', { encoding: 'utf-8' }).trim());
const tryMkDir = (path:string) => {try {mkdirSync(path)} catch {/*empty*/} }

tryMkDir("../storage")
tryMkDir("../storage/music")
tryMkDir("../storage/podcast")
tryMkDir("../storage/video")

export const handle = async ({ event, resolve }) => {
	const cookies = event.cookies;

	if (event.url.pathname == '/logout') {
		cookies.delete('session', { path: '/' });
		throw redirect(301, '/');
	}

	const session = cookies.get('session');
	if (session) {
		if (password == session) {
			const expires = new Date();
			expires.setTime(Date.now() + 2629800000); // 1 month in MS
			cookies.set('session', password, {
				path: '/',
				expires
			});
			return await resolve(event);
		} else {
			cookies.delete('session', {
				path: '/'
			});
		}
	}

	if (event.url.pathname != '/') throw redirect(301, '/');
	return await resolve(event);
};
