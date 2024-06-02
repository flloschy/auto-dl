import type { Broadcast_able } from './types';

export const streams = new Set<ReadableStreamDefaultController>();

export const broadcast = (message: Broadcast_able) => {
	for (const stream of streams) {
		stream.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(message)}\n\n`));
	}
};
