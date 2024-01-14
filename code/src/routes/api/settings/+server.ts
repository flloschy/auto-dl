import { getSettings, setSettings } from '$lib/settings';

export const POST = async ({ request }) => {
	const { autoInterval, waitlistInterval, toggle } = await request.json();
	setSettings({
		autoDownloadingEnabled: toggle,
		waitListIntervalTime: waitlistInterval,
		channelListIntervalTime: autoInterval,
        storagePercentPath: getSettings().storagePercentPath
	});
	return new Response('OK');
};
