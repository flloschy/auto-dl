import { streams } from '$lib/broadcaster';

export async function GET() {
	let controller: ReadableStreamDefaultController | undefined;
	const stream = new ReadableStream({
		start(control) {
			controller = control;
			controller.enqueue(new TextEncoder().encode(': ping\n\n'));
			streams.add(controller);
		},

		cancel() {
			if (controller) streams.delete(controller);
		}
	});
	const response = new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});

	return response;
}
