import { encrypt } from '$lib';

export const actions = {
	default: async ({ cookies, request }) => {
		const data = await request.formData();
		const password = data.get('password') as string;

		const expires = new Date();
		expires.setTime(Date.now() + 2629800000);

		cookies.set('session', encrypt(password), {
			path: '/',
			expires
		});

		return {};
	}
};
