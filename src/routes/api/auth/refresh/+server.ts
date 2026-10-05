/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { NotImplementedException } from '#lib/exception/http/not-implemented-exception.js';
import { JWTType } from '#lib/schema/base/jwt.js';
import { createApiRoute } from '#lib/server/utils/api.js';
import { verifyAuth } from '#lib/server/utils/auth.js';
import { logger } from '#lib/server/utils/logger.js';

export const POST = createApiRoute(async ({ cookies }) => {
	const user = await verifyAuth(cookies, JWTType.REFRESH);
	logger.debug('User verified for refresh:', user);

	throw new NotImplementedException();
});
