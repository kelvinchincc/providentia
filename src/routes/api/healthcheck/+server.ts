/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { createOkApiResponse } from '#lib/schema/api/base.js';
import { healthcheckApiDataSchema } from '#lib/schema/api/healthcheck.js';
import { createApiRoute, okResponse } from '#lib/server/utils/api.js';
import { needInitializationCheck } from '#lib/server/utils/healthcheck.js';

/**
 * Reports service status and whether the app has been initialized with a user.
 *
 * Does not require authentication. Database errors are not caught here and produce a 500.
 *
 * @returns A 200 response with `status: 'ok'` and `initialized` set to `true` once a user exists.
 */
export const GET = createApiRoute(async () => {
	const needInitialization = await needInitializationCheck();

	return okResponse(
		createOkApiResponse(healthcheckApiDataSchema, {
			status: 'ok',
			initialized: !needInitialization
		})
	);
});
