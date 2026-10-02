import { createOkApiResponse } from '$lib/schema/api/base';
import { healthcheckApiDataSchema } from '$lib/schema/api/healthcheck';
import { db } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	const result = await db.query.user.findFirst();
	const needInitialization = !result;

	return json(
		createOkApiResponse(healthcheckApiDataSchema, {
			status: 'ok',
			initialized: !needInitialization
		})
	);
};
