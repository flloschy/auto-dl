import { existsSync, mkdirSync, readFileSync } from 'fs';
import { redirect } from '@sveltejs/kit';
import Logger from '$lib/logger';
const logger = Logger.getLogger('auth');

const password = readFileSync('./PASSWORD').toString().trim();
const tryMkDir = (path: string) => {
	if (existsSync(path)) {
		logger.debug('Attempting to create', path, 'but already exists');
		return;
	}
	logger.debug('Created', path);
	mkdirSync(path);
};

logger.info('The active password is:', password);

tryMkDir('./downloads');
tryMkDir('./downloads/music');
tryMkDir('./downloads/podcast');
tryMkDir('./downloads/video');

export const handle = async ({ event, resolve }) => {
	const cookies = event.cookies;

	if (event.url.pathname == '/logout') {
		logger.debug('Logout route');
		cookies.delete('session', { path: '/' });
		throw redirect(301, '/login');
	}
	if (event.url.pathname == '/login') {
		logger.debug('login route');
		return await resolve(event);
	}

	const session = cookies.get('session');
	if (session) {
		logger.debug('session exists');
		if (password == session.trim()) {
			logger.debug('Correct passoword');
			const expires = new Date(Date.now() + 2629800000); // 1 month in MS
			cookies.set('session', password, {
				path: '/',
				expires
			});
			return await resolve(event);
		}
		logger.debug('Incorrect Password:', session);
	}

	logger.debug('Route to login');
	throw redirect(301, '/login');
};
