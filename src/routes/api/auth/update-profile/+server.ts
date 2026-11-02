/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { BadRequestException } from '#lib/exception/http/bad-request-exception.js';
import { NotFoundException } from '#lib/exception/http/not-found-exception.js';
import { updateProfileSchema } from '#lib/schema/api/update-profile.js';
import { db } from '#lib/server/db/index.js';
import { user } from '#lib/server/db/schemas/user.schema.js';
import { createApiRoute, noContentResponse } from '#lib/server/utils/api.js';
import { hashPassword, invalidateTokens, verifyAuth } from '#lib/server/utils/auth.js';
import { generateCurrentTimestamp } from '#lib/server/utils/datetime.js';
import { eq } from 'drizzle-orm';

/**
 * Updates the authenticated user's username and/or password.
 *
 * Flow: verify auth, validate body with `updateProfileSchema`, check that
 * `confirmPassword` matches `password`, hash the new password if given, then
 * update the user row in a transaction. Changing the profile invalidates the
 * user's existing tokens and clears the `auth` and `refresh` cookies, so the
 * client must sign in again.
 *
 * If neither `username` nor `password` is provided, nothing is written and
 * a 204 response is returned.
 *
 * @param event - The request event provided by `createApiRoute`.
 * @param event.cookies - Cookies used to verify auth and to clear session cookies.
 * @param event.request - Incoming request whose JSON body contains the profile update.
 * @returns A 204 No Content response on success.
 * @throws {BadRequestException} 400 if the body fails schema validation or `confirmPassword` does not match `password`.
 * @throws {NotFoundException} 404 if the authenticated user's row no longer exists.
 */
export const POST = createApiRoute(async ({ cookies, request }) => {
	const authedUser = await verifyAuth(cookies);
	const body = updateProfileSchema.safeParse(await request.json());

	if (!body.success) {
		throw new BadRequestException('Invalid request body' + body.error.message);
	}

	if (body.data.confirmPassword !== body.data.password) {
		throw new BadRequestException('Passwords do not match');
	}

	const passwordHash = body.data.password ? await hashPassword(body.data.password) : undefined;

	if (!body.data.username && !passwordHash) {
		return noContentResponse();
	}

	await db.transaction(async (tx) => {
		const result = await tx
			.update(user)
			.set({
				username: body.data.username,
				passwordHash,
				updatedAt: generateCurrentTimestamp()
			})
			.where(eq(user.id, authedUser.id));
		const affectedRows = result.rowsAffected;

		if (affectedRows <= 0) {
			throw new NotFoundException('User not found');
		}
	});
	await invalidateTokens(authedUser);
	cookies.delete('auth', { path: '/' });
	cookies.delete('refresh', { path: '/' });

	return noContentResponse();
});
