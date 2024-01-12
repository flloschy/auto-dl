import { setSettings } from '$lib/settings';

export const POST = async ({ request }) => {
	const { autoInterval, waitlistInterval, toggle } = await request.json();
	setSettings({
		autoDownloadingEnabled: toggle,
		waitListIntervalTime: waitlistInterval,
		channelListIntervalTime: autoInterval,
	});
	return new Response('OK');
};
