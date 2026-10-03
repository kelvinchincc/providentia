/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { db } from '#lib/server/db/index.js';
import { user as userRepo } from '#lib/server/db/schemas/index.js';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from '../../healthcheck/$types';
import {
	registerUserRequestSchema,
	type RegisterUserRequest
} from '#lib/schema/api/register-user.js';
import { generateSeed, hashPassword } from '#lib/server/utils/auth.js';
import { needInitializationCheck } from '#lib/server/utils/healthcheck.js';
import { createBasicOkApiResponse, createErrApiResponse } from '#lib/schema/api/base.js';

export const POST: RequestHandler = async ({ request }) => {
	const body: RegisterUserRequest = await request.json();
	const initialized = !(await needInitializationCheck());

	if (initialized) {
		return Response.json(createErrApiResponse('Forbidden'), { status: 403 });
	}

	try {
		registerUserRequestSchema.parse(body);
	} catch (error) {
		return Response.json(createErrApiResponse('Bad Request'), { status: 400 });
	}

	if (body.password !== body.confirmPassword) {
		return Response.json(createErrApiResponse('Bad Request'), { status: 400 });
	}

	const existingUser = await db.query.user.findFirst({
		where: eq(userRepo.username, body.username)
	});

	if (existingUser) {
		return Response.json(createErrApiResponse('Conflict'), { status: 409 });
	}

	await db.transaction(async (tr) => {
		await tr.insert(userRepo).values({
			username: body.username,
			jwtSeed: generateSeed(),
			passwordHash: await hashPassword(body.password),
			refreshTokenSeed: generateSeed()
		});
	});

	return Response.json(createBasicOkApiResponse('Created'), { status: 201 });
};
