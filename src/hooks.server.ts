import { mkdirSync, readFileSync } from 'fs';
import { redirect } from '@sveltejs/kit';

const password = readFileSync("./PASSWORD")
const tryMkDir = (path:string) => {try {mkdirSync(path)} catch {/*empty*/} }

console.log("password: " + password)

tryMkDir("./downloads")
tryMkDir("./downloads/music")
tryMkDir("./downloads/podcast")
tryMkDir("./downloads/video")

export const handle = async ({ event, resolve }) => {
	const cookies = event.cookies;

	if (event.url.pathname == '/logout') {
		cookies.delete('session', { path: '/' });
		throw redirect(301, '/login');
	}
	if (event.url.pathname == "/login") {
		return await resolve(event)
	}

	const session = cookies.get('session');
	if (session) {
		if (password == session) {
			const expires = new Date(Date.now() + 2629800000); // 1 month in MS
			cookies.set('session', password, {
				path: '/',
				expires
			});
			return await resolve(event);
		}
	}
	throw redirect(301, "/login")
};
