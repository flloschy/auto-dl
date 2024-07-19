import { frontEndReadyCommands } from '$lib/commandManager/commandLib/Handler';

export const load = async () => {
	const commands = Object.fromEntries(
		frontEndReadyCommands.map((command) => [command.name, command])
	);
	return { commands };
};
