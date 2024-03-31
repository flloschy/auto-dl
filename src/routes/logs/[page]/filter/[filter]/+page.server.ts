import { clearLogs, getLogs, getPages } from '$lib/database/functions/logs';
import { type Actions, redirect } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const filter = params.filter;
	if (!['ALL', 'SETUP', 'DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'].includes(filter))
		throw redirect(301, `/logs/0/filter/All`);

	const page = params.page;
	let num: number;
	try {
		num = parseInt(page);
	} catch {
		throw redirect(301, `/logs/0/filter/${filter}`);
	}

	if (num < 0) throw redirect(301, `/logs/0/filter/${filter}`);
	const maxPage = getPages(filter);
	if (num > maxPage) throw redirect(301, `/logs/${maxPage}/filter/${filter}`);

	return { logs: getLogs(num, filter), page: num, maxPage, filter };
};

export const actions: Actions = {
	default: () => {
		clearLogs();
	}
};
