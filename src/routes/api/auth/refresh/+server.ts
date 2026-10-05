/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { JWTType } from '#lib/schema/base/jwt.js';
import { createApiRoute, noContentResponse } from '#lib/server/utils/api.js';
import { verifyAuth } from '#lib/server/utils/auth.js';
import { logger } from '#lib/server/utils/logger.js';

export const POST = createApiRoute(async ({ cookies }) => {
	logger.debug('Received cookies: ', JSON.stringify(cookies.getAll()));
	const user = await verifyAuth(cookies, JWTType.REFRESH);
	logger.info('User verified for refresh:' + JSON.stringify(user));

	return noContentResponse();
});
