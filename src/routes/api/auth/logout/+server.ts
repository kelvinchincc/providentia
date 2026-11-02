/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { UnauthorizedException } from '#lib/exception/http/unauthorized-exception.js';
import { JWTType } from '#lib/schema/base/jwt.js';
import { createApiRoute, noContentResponse } from '#lib/server/utils/api.js';
import { verifyAuth } from '#lib/server/utils/auth.js';
import { logger } from '#lib/server/utils/logger.js';

/**
 * Logs the user out by deleting the `auth` and `refresh` cookies.
 *
 * The refresh token is verified first, but logout proceeds either way. An unauthenticated
 * request is logged at debug level. Any other verification error is logged at error level.
 * In both cases the cookies are cleared.
 *
 * @param event - Request event providing the `cookies` store.
 * @returns A `204 No Content` response.
 */
export const POST = createApiRoute(async ({ cookies }) => {
	try {
		await verifyAuth(cookies, JWTType.REFRESH);
	} catch (error) {
		if (error instanceof UnauthorizedException) {
			logger.debug('User not authenticated, but proceeding with logout');
		} else {
			logger.error(`Error verifying auth during logout: ${error}`);
		}
	}

	cookies.delete('auth', { path: '/' });
	cookies.delete('refresh', { path: '/' });
	return noContentResponse();
});
