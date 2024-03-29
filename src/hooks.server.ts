const filePath = 'src/hooks.server.ts';

import '$lib/database/database';
import { initCronjob } from '$lib/cronjobs';
import { redirect } from '@sveltejs/kit';
import { password, username } from '$lib/settings';
import { logDebug, logSetup, logWarning } from '$lib/database/functions/logs';
import { videos } from '$lib/database/tables/videos';
import { seasons } from '$lib/database/tables/seasons';
import { channels } from '$lib/database/tables/channels';
import { getWaitlist } from '$lib/database/functions/waitlist';
import { settings } from '$lib/database/tables/settings';

initCronjob();

logSetup('done', '', filePath, '');

export async function handle({ event, resolve }) {
	if (
		event.url.pathname == '/health' ||
		event.url.pathname == "/robots.txt" ||
		event.url.pathname == 'favicon.png'
	) {
		return new Response('ok');
	}
	if (event.url.pathname == '/logout') {
		event.cookies.delete('username', { path: '/' });
		event.cookies.delete('password', { path: '/' });
		logDebug('user logout', '', filePath, 'handle');
		return redirect(301, '/login');
	}

	const user = event.cookies.get('username');
	const pwd = event.cookies.get('password');

	if (user != username || pwd != password) {
		logWarning('access denied', `path: ${event.url.pathname}; user: ${user}; password: ${pwd};`, filePath, '');
		event.cookies.delete('username', { path: '/' });
		event.cookies.delete('password', { path: '/' });
		if (event.url.pathname != '/login') return redirect(301, '/login');
	} else if (event.url.pathname == '/') return redirect(301, '/dashboard');

	if (event.url.pathname.startsWith('/logs')) {
		const slashes = event.url.pathname.split('/').length;
		if (slashes < 5) return redirect(301, '/logs/0/filter/ALL');
	}

	if (event.url.pathname == '/export') {
		return new Response(
			JSON.stringify({
				settings: Object.fromEntries(settings.entries()),
				channels: Object.fromEntries(channels.entries()),
				seasons: Object.fromEntries(seasons.entries()),
				videos: Object.fromEntries(videos.entries()),
				waitlist: getWaitlist()
			})
		);
	}
	return await resolve(event);
}
