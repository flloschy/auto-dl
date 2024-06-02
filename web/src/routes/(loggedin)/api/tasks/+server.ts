import { states } from '$lib/tasks/taskManager';
export const GET = async () => {
	return new Response(JSON.stringify(states));
};
