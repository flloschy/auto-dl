import { getCPUusage } from '$lib/getStats';
import { json } from '@sveltejs/kit';

export const GET = async () => {
	return json(await getCPUusage());
};