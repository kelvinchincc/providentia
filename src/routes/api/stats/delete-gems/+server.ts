/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { BadRequestException } from '#lib/exception/http/bad-request-exception.js';
import { db } from '#lib/server/db/index.js';
import { gem } from '#lib/server/db/schemas/gem.schema.js';
import { lazyUpdateStats } from '#lib/server/services/stats.service.js';
import { createApiRoute, noContentResponse } from '#lib/server/utils/api.js';
import { verifyAuth } from '#lib/server/utils/auth.js';
import { and, eq } from 'drizzle-orm';

/**
 * Deletes one gem and removes its amount from the user's stats.
 *
 * The delete and stat update run in one transaction. Returns 204 even when no gem owned by the
 * user matches `id`, in which case the stats are left unchanged.
 *
 * @param event - The request event provided by `createApiRoute`.
 * @param event.cookies - Cookies used to verify the access token.
 * @param event.url - Request URL whose `id` query parameter names the gem to delete.
 * @returns A 204 No Content response on success.
 * @throws {UnauthorizedException} 401 if the user is not authenticated.
 * @throws {BadRequestException} 400 if the `id` query parameter is missing.
 */
export const DELETE = createApiRoute(async ({ cookies, url }) => {
	const user = await verifyAuth(cookies);

	const urlParams = new URLSearchParams(url.search);
	const id: string | null = urlParams.get('id');

	if (id === null) {
		throw new BadRequestException('Missing id parameter');
	}

	await db.transaction(async (tx) => {
		const record = await tx
			.select()
			.from(gem)
			.where(and(eq(gem.userId, user.id), eq(gem.id, id)))
			.limit(1);
		await tx.delete(gem).where(and(eq(gem.userId, user.id), eq(gem.id, id)));
		await lazyUpdateStats(tx, {
			userId: user.id,
			// Negative amount to indicate that we are removing gems from the total
			changes: [{ type: record[0]?.type || 'free', amount: -(record[0]?.amount || 0) }]
		});
	});
	return noContentResponse();
});
