import { run } from '$lib/downloader/waitlist';
import { json } from '@sveltejs/kit';

export function GET() {
	run();
	return json('ok');
}
