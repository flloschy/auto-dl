import { redirect, type Actions } from '@sveltejs/kit';

export const actions:Actions = {
    default: async ({request, cookies}) => {
        const formData = await request.formData()
        const password = formData.get("password") as string
        cookies.set("session", password, {
            path: "/"
        })
        throw redirect(301, "/")
    }
};