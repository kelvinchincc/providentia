/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AUTH_COOKIE_TTL_MS, REFRESH_COOKIE_TTL_MS } from '#lib/constants/cookies.js';
import { createOkApiResponse } from '#lib/schema/api/base.js';
import { loginApiDataSchema, type LoginApiData } from '#lib/schema/api/login.js';
import { JWTType } from '#lib/schema/base/jwt.js';
import { db } from '#lib/server/db/index.js';
import { user as userRepo } from '#lib/server/db/schemas/user.schema.js';
import { createApiRoute, noContentResponse, okResponse } from '#lib/server/utils/api.js';
import { generateSeed, signJWTSecret, verifyAuth } from '#lib/server/utils/auth.js';

export const POST = createApiRoute(async ({ cookies }) => {
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
