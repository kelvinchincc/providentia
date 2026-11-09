/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
	AUTH_COOKIE_TTL_MS,
	COOKIE_OPTIONS,
	REFRESH_COOKIE_TTL_MS
} from '#lib/constants/cookies.js';
import { createOkApiResponse } from '#lib/schema/api/base.js';
import { loginApiDataSchema, type LoginApiData } from '#lib/schema/api/login.js';
import { JWTType } from '#lib/schema/base/jwt.js';
import { createApiRoute, okResponse } from '#lib/server/utils/api.js';
import { signJWTSecret, verifyAuth } from '#lib/server/utils/auth.js';
import { logger } from '#lib/server/utils/logger.js';

/**
 * Rotates the auth and refresh cookies using a valid refresh token.
 *
 * Verifies the `refresh` cookie, then signs new access and refresh JWTs from the user's current
 * seeds and sets both as `sameSite: strict` cookies.
 *
 * @param event - The request event provided by `createApiRoute`.
 * @param event.cookies - Cookies used to verify the refresh token and to set the new JWTs.
 * @returns A 200 response with the username and token TTLs.
 * @throws {UnauthorizedException} 401 if the refresh cookie is missing or invalid.
 */
export const POST = createApiRoute(async ({ cookies }) => {
	logger.info(
		`auth cookie: ${cookies.get(COOKIE_OPTIONS.AUTH_COOKIE)}, ref cookie: ${cookies.get(COOKIE_OPTIONS.REFRESH_COOKIE)}`
	);
	const user = await verifyAuth(cookies, JWTType.REFRESH);

	const newAuthJWT = await signJWTSecret({
		s: user.jwtSeed,
		t: JWTType.ACCESS,
		u: user.id
	});
	const newRefreshJWT = await signJWTSecret({
		s: user.refreshTokenSeed,
		t: JWTType.REFRESH,
		u: user.id
	});
	const loginPayload: LoginApiData = {
		authToken: 'cookie',
		refreshToken: 'cookie',
		authTokenTTL: AUTH_COOKIE_TTL_MS,
		refreshTokenTTL: REFRESH_COOKIE_TTL_MS,
		username: user.username
	};

	cookies.set('auth', newAuthJWT, { sameSite: 'strict' });
	cookies.set('refresh', newRefreshJWT, { sameSite: 'strict' });
	return okResponse(createOkApiResponse(loginApiDataSchema, loginPayload));
});
