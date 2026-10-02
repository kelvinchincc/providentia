import { createOkApiResponse } from '$lib/schema/api/base';
import { healthcheckApiDataSchema } from '$lib/schema/api/healthcheck';
import { needInitializationCheck } from '$lib/server/utils/healthcheck';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	const needInitialization = await needInitializationCheck();

	return json(
		createOkApiResponse(healthcheckApiDataSchema, {
			status: 'ok',
			initialized: !needInitialization
		})
	);
};
