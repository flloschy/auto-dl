import { getWaitlist, setWaitlist } from './access';

export const removeWaitlist = (line: string) =>
	setWaitlist(getWaitlist().filter((l) => l != line));
