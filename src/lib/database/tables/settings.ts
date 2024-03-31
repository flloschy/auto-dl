import Enmap from 'enmap';
import { logInfo } from '../functions/logs';

// import cron from 'cron-parser';

export const settings = new Enmap<string, number, number>('settings', {
	dataDir: './data/database/'
});
settings.ensure('interval', 24); // 1 day
settings.ensure('auto', 0);
settings.ensure('tick', 0);

export let intervalValue = settings.get('interval') ?? 24;
export let autoValue = settings.get('auto') == 1;
let tick = settings.get('tick') ?? 24;

export function editInterval(hours: number) {
	hours = Math.min(168, Math.max(hours, 1)); // 1h - 7d
	if (hours != intervalValue)
		logInfo(
			'settings changed',
			`interval: ${intervalValue} -> ${hours}`,
			'src/lib/database/tables/settings.ts',
			'editInterval'
		);

	intervalValue = hours;
	settings.set('interval', hours);
	tick = 0;
	settings.set('tick', tick);
}
export function editAuto(state: boolean) {
	if (autoValue != state)
		logInfo(
			'settings changed',
			`auto: ${autoValue} -> ${state}`,
			'src/lib/database/tables/settings.ts',
			'editAuto'
		);
	autoValue = state;
	settings.set('auto', Number(state));
}
export function stepTick() {
	if (!autoValue) return false;
	tick++;
	const run = tick >= intervalValue;
	if (run) tick = 0;
	settings.set('tick', tick);
	return run;
}
export function nextRun() {
	const hours = intervalValue - tick - 1;
	const minutes = hours * 60;
	const adjustedMinutes = minutes - new Date().getMinutes();
	const seconds = adjustedMinutes * 60;
	const adjustedSeconds = seconds - new Date().getSeconds();
	const milliseconds = adjustedSeconds * 1000;
	return Date.now() + milliseconds;
}
export function resetInterval() {
	tick = 0;
	settings.set('tick', tick);
}
