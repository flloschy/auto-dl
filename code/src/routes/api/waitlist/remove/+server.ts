import { removeWaitlist } from '$lib/waitlist/remove';

export async function POST({ request }) {
	removeWaitlist(
		(await request.body?.getReader().read())?.value?.toString() as string,
	);
	return new Response('OK');
}
