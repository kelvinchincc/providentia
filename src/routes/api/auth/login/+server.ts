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
		if (result) throw new UnauthorizedException('Invalid credentials');

		const jwt = await signJWTSecret({
			u: user.id,
			t: JWTType.ACCESS,
			s: user.jwtSeed
		});
		const refreshJwt = await signJWTSecret({
			u: user.id,
			t: JWTType.REFRESH,
			s: user.jwtSeed
		});

		cookies.set('auth', jwt, { sameSite: 'strict' });
		cookies.set('refresh', refreshJwt, { sameSite: 'strict' });

		const response: LoginApiData = {
			username: user.username,
			authToken: 'cookie',
			authTokenTTL: 3600,
			refreshToken: 'cookie',
			refreshTokenTTL: 604800
		};
		return okResponse(createOkApiResponse(loginApiDataSchema, response));
	} catch (error) {
		logger.error('Error during login:', error);
		throw new BadRequestException('Malformed request');
	}
});
