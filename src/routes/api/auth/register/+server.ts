/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { db } from '#lib/server/db/index.js';
import { user as userRepo } from '#lib/server/db/schemas/index.js';
import { eq } from 'drizzle-orm';
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

/**
 * Creates the initial user account. Only allowed before any user exists.
 *
 * Checks that the app is not yet initialized, validates the body, confirms the passwords match,
 * rejects duplicate usernames, then stores the user with a hashed password and fresh JWT and
 * refresh token seeds.
 *
 * @param event - The request event provided by `createApiRoute`.
 * @param event.request - Incoming request whose JSON body holds `username`, `password` and
 * `confirmPassword`.
 * @returns A 201 response with a `created` message.
 * @throws {ForbiddenException} 403 if the app is already initialized.
 * @throws {BadRequestException} 400 if the body is malformed or the passwords do not match.
 * @throws {ConflictException} 409 if the username already exists.
 * @throws {InternalServerErrorException} 500 on unexpected errors, such as failed password
 * hashing. See src/lib/exception/http/internal-server-error-exception.ts
 */
export const POST = createApiRoute(async ({ request }) => {
	const body: RegisterUserRequest = await request.json();

	const initialized = !(await needInitializationCheck());
	if (initialized) {
		throw new ForbiddenException();
	}

	try {
		registerUserRequestSchema.parse(body);
	} catch (_error) {
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
