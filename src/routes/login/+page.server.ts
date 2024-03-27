const filePath = 'src/route/login/+page.server.ts';

import { logInfo, logWarning } from '$lib/database/functions/logs';
import { cookieExpiresInDays, password, username } from '$lib/settings';
import { redirect, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	default: async ({ request, cookies, getClientAddress }) => {
		const data = await request.formData();
		const user = data.get('username');
		const pass = data.get('password');

		if (user == username && pass == password) {
			logInfo('Successful Login', `ip: ${getClientAddress()}`, filePath, 'actions/default');

			const expires = new Date();
			expires.setTime(
				expires.getTime() + cookieExpiresInDays * 24 * 60 * 60 * 1000 // days * 24 = hours * 60 = minutes * 60 = seconds * 1000 = milliseconds
			);
			cookies.set('username', username, { path: '/', expires });
			cookies.set('password', password, { path: '/', expires });
			throw redirect(301, '/dashboard');
		}

		logWarning(
			'Invalid Login',
			`ip: ${getClientAddress()}; user: ${user}; password: ${pass}`,
			filePath,
			'actions/default'
		);

		return { success: true, now: Date.now() };
	}
};
