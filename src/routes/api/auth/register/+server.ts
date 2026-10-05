/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { db } from '#lib/server/db/index.js';
import { user as userRepo } from '#lib/server/db/schemas/index.js';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from '../../auth/register/$types';
import {
	registerUserRequestSchema,
	type RegisterUserRequest
} from '#lib/schema/api/register-user.js';
import { generateSeed, hashPassword } from '#lib/server/utils/auth.js';
import { needInitializationCheck } from '#lib/server/utils/healthcheck.js';
import { createBasicOkApiResponse } from '#lib/schema/api/base.js';
import { createApiRoute, okResponse } from '#lib/server/utils/api.js';
import {
	BadRequestException,
	ForbiddenException,
	ConflictException
} from '#lib/exception/http/index.js';

export const POST = createApiRoute(async ({ request }) => {
	const body: RegisterUserRequest = await request.json();

	const initialized = !(await needInitializationCheck());
	if (initialized) {
		throw new ForbiddenException();
	}

	try {
		registerUserRequestSchema.parse(body);
	} catch (error) {
		throw new BadRequestException('Malformed request');
	}

	if (body.password !== body.confirmPassword) {
		throw new BadRequestException('Passwords do not match');
	}

	const existingUser = await db.query.user.findFirst({
		where: eq(userRepo.username, body.username)
	});

	if (existingUser) {
		throw new ConflictException('Username already exists');
	}

	await db.transaction(async (tr) => {
		await tr.insert(userRepo).values({
			username: body.username,
			jwtSeed: generateSeed(),
			passwordHash: await hashPassword(body.password),
			refreshTokenSeed: generateSeed()
		});
	});

	return okResponse(createBasicOkApiResponse('created'), 201);
});
