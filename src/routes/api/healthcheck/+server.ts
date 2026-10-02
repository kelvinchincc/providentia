import { db } from "$lib/server/db";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async () => {
	const result = await db.query.user.findFirst();
	const needInitialization = !result;

	return json({
		status: 'ok',
		initialized: !needInitialization,
	})
}
