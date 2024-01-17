import { sequence } from '@sveltejs/kit/hooks';
import { env } from '$env/dynamic/private';
import { redirect, type Handle } from '@sveltejs/kit';

const auth: Handle = async ({ event, resolve }) => {
    if (event.route.id == "/health") return await resolve(event)
	if (!env.ADMIN_AUTH) {
		return new Response('Not authorized, no ADMIN_AUTH', {
			status: 401,
		});
	}
	const basicAuth = event.request.headers.get('Authorization');
	if (basicAuth !== `Basic ${btoa(env.ADMIN_AUTH)}`) {
		return new Response('Not authorized', {
			status: 401,
			headers: {
				'WWW-Authenticate':
					'Basic realm="User Visible Realm", charset="UTF-8"',
			},
		});
	}
	if (event.route.id == null) {
		// return new Response('Redirect', {status: 303, headers: { Location: '/home' }});
		return redirect(301, '/home');
	}

	const response = await resolve(event);
	return response;
};

export const handle: Handle = sequence(auth);
