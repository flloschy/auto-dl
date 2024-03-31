const filePath = 'src/lib/database/functions/logs.ts';

import chalk from 'chalk';
import { logs } from '../tables/logs';
import { logsPerPage } from '$lib/settings';

// console
function c(type: string, message: string, details: string, file: string, fn: string) {
	console.log(
		`[${chalk.green(new Date().toLocaleTimeString())}] ${type} ${chalk.white(message)} (${chalk.gray(file)}${chalk.bold.gray(fn == '' ? '' : ' ' + fn + '()')})${details == '' ? '' : '\n\t' + details}`
	);
}
// database
function d(type: string, message: string, details: string, file: string, fn: string) {
	logs.set(new Date().getTime().toString(), {
		type,
		time: new Date(),
		message,
		details,
		origin: {
			file,
			fn
		}
	});
}

export function logSetup(message: string, details: string, file: string, fn: string) {
	d('SETUP', message, details, file, fn);
	c(chalk.white('SETUP'), message, details, file, fn);
}
export function logDebug(message: string, details: string, file: string, fn: string) {
	d('DEBUG', message, details, file, fn);
	c(chalk.magentaBright('DEBUG'), message, details, file, fn);
}
export function logInfo(message: string, details: string, file: string, fn: string) {
	d('INFO', message, details, file, fn);
	c(chalk.cyan('INFO'), message, details, file, fn);
}
export function logWarning(message: string, details: string, file: string, fn: string) {
	d('WARNING', message, details, file, fn);
	c(chalk.yellow('WARNING'), message, details, file, fn);
}
export function logError(message: string, details: string, file: string, fn: string) {
	d('ERROR', message, details, file, fn);
	c(chalk.red('ERROR'), message, details, file, fn);
}
export function logCritical(message: string, details: string, file: string, fn: string) {
	d('CRITICAL', message, details, file, fn);
	c(chalk.bgRed.white.bold('CRITICAL'), message, details, file, fn);
}

export function getLogs(page: number, type: string) {
	const filtered = type == 'ALL' ? logs : logs.filter((l) => l.type == type);
	const sorted = filtered.array().sort((a, b) => b.time.getTime() - a.time.getTime());
	const paged = [];
	for (let index = page * logsPerPage; index < (page + 1) * logsPerPage; index++) {
		const log = sorted.at(index);
		if (log == undefined) break;
		paged.push(log);
	}
	return paged;
}
export function getPages(filter: string) {
	if (filter == 'ALL') return Math.floor(logs.count / logsPerPage);
	return Math.floor(logs.filter((l) => l.type == filter).count / logsPerPage);
}

export function clearLogs() {
	logs.deleteAll();
	logInfo('cleared logs', '', filePath, 'clearLogs');
}
