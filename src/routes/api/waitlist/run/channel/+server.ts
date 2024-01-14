import { run } from '$lib/downloader/channel';
import { json } from '@sveltejs/kit';

export function GET() {
	run();
	return json('ok');
}
