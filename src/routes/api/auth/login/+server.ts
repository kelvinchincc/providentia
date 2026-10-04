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
import { verifyPassword } from '#lib/server/utils/auth.js';
import { logger } from '#lib/server/utils/logger.js';

export const POST: RequestHandler = async ({ request }) => {
	const body: LoginRequest = await request.json();

	if (loginRequestSchema.safeParse(body).error)
		return Response.json(createErrApiResponse('Malformed request'), { status: 400 });

	try {
		const user = await db.query.user.findFirst({ where: eq(userRepo.username, body.username) });
		if (!user) return Response.json(createErrApiResponse('User not found'), { status: 404 });

		const result = await verifyPassword(user.passwordHash, body.password);
		if (result)
			return Response.json(createErrApiResponse('Invalid credentials'), { status: 401 });

		// TODO: Implement session management and return a session token or cookie here
		return Response.json({ user }, { status: 200 });
	} catch (error) {
		logger.error('Error during login:', error);
		return Response.json(createErrApiResponse('Malformed request'), { status: 400 });
	}
};
