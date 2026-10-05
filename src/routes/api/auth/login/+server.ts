/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import type { RequestHandler } from '../../auth/login/$types';
import { createErrApiResponse } from '#lib/schema/api/base.js';
import { db } from '#lib/server/db/index.js';
import { eq } from 'drizzle-orm';
import { loginRequestSchema, type LoginRequest } from '#lib/schema/api/login.js';
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

export const POST = createApiRoute(async ({ request }) => {
	const body: LoginRequest = await request.json();

	if (loginRequestSchema.safeParse(body).error)
		throw new BadRequestException('Malformed request');

	try {
		const user = await db.query.user.findFirst({
			where: eq(userRepo.username, body.username)
		});
		if (!user) throw new NotFoundException('User not found');

		const result = await verifyPassword(user.passwordHash, body.password);
		if (result) throw new UnauthorizedException('Invalid credentials');

		// TODO: Implement session management and return a session token or cookie here
		const jwtPayload = await signJWTSecret({
			u: user.id,
			s: user.jwtSeed,
			t: JWTType.ACCESS
		});
		return okResponse(jwtPayload);
	} catch (error) {
		logger.error('Error during login:', error);
		throw new BadRequestException('Malformed request');
	}
});
