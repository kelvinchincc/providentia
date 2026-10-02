/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
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
