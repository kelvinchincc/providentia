/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { createOkApiResponse } from '#lib/schema/api/base.js';
import { db } from '#lib/server/db/index.js';
import { eq } from 'drizzle-orm';
import {
	loginApiDataSchema,
	loginRequestSchema,
	type LoginApiData,
	type LoginRequest
} from '#lib/schema/api/login.js';
import { user as userRepo } from '#lib/server/db/schemas/index.js';
import { signJWTSecret, verifyPassword } from '#lib/server/utils/auth.js';
import { logger } from '#lib/server/utils/logger.js';
import { JWTType } from '#lib/schema/base/jwt.js';
import { createApiRoute, okResponse } from '#lib/server/utils/api.js';
import {
	BadRequestException,
	NotFoundException,
	UnauthorizedException
} from '#lib/exception/http/index.js';
import {
	AUTH_COOKIE_TTL_MS,
	COOKIE_OPTIONS,
	REFRESH_COOKIE_TTL_MS
} from '#lib/constants/cookies.js';

/**
 * Authenticates a user with username and password, then sets the auth and refresh cookies.
 *
 * Validates the body with `loginRequestSchema`, verifies the password hash, and signs access and
 * refresh JWTs seeded from the user's `jwtSeed` and `refreshTokenSeed`. Both are set as
 * `sameSite: strict` cookies. Tokens are not returned in the response body.
 *
 * @param event - The request event provided by `createApiRoute`.
 * @param event.cookies - Cookies in which the signed auth and refresh JWTs are set.
 * @param event.request - Incoming request whose JSON body holds `username` and `password`.
 * @returns A 200 response with the username and token TTLs.
 * @throws {BadRequestException} 400 if the body fails schema validation.
 * @throws {NotFoundException} 404 if no user has the given username.
 * @throws {UnauthorizedException} 401 if the password does not match.
 * @throws {InternalServerErrorException} 500 on unexpected errors, such as failed password
 * verification. See src/lib/exception/http/internal-server-error-exception.ts
 */
export const POST = createApiRoute(async ({ request, cookies }) => {
	const body: LoginRequest = await request.json();

	try {
		loginRequestSchema.parse(body);
	} catch (error) {
		logger.debug('Validation error during login:', error);
		throw new BadRequestException('Malformed request');
	}

	try {
		const user = await db.query.user.findFirst({
			where: eq(userRepo.username, body.username)
		});
		if (!user) throw new NotFoundException('User not found');

		const result = await verifyPassword(user.passwordHash, body.password);
		if (!result) throw new UnauthorizedException('Invalid credentials');

		const jwt = await signJWTSecret({
			u: user.id,
			t: JWTType.ACCESS,
			s: user.jwtSeed
		});
		const refreshJwt = await signJWTSecret({
			u: user.id,
			t: JWTType.REFRESH,
			s: user.refreshTokenSeed
		});

		cookies.set(COOKIE_OPTIONS.AUTH_COOKIE, jwt, { sameSite: 'strict' });
		cookies.set(COOKIE_OPTIONS.REFRESH_COOKIE, refreshJwt, { sameSite: 'strict' });

		const response: LoginApiData = {
			username: user.username,
			authToken: 'cookie',
			authTokenTTL: AUTH_COOKIE_TTL_MS,
			refreshToken: 'cookie',
			refreshTokenTTL: REFRESH_COOKIE_TTL_MS
		};
		return okResponse(createOkApiResponse(loginApiDataSchema, response));
	} catch (error) {
		logger.error('Error during login:', error);
		throw error;
	}
});
