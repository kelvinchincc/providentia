/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { db } from '#lib/server/db/index.js';
import { updateStats } from '#lib/server/services/stats.service.js';
import { createApiRoute, noContentResponse } from '#lib/server/utils/api.js';
import { verifyAuth } from '#lib/server/utils/auth.js';

/**
 * Recalculates the authenticated user's stats from all gem records.
 *
 * Runs a full table scan through `updateStats`, which is slower than the incremental updates
 * the gem routes perform.
 *
 * @param event - The request event provided by `createApiRoute`.
 * @param event.cookies - Cookies used to verify the access token.
 * @returns A 204 No Content response on success.
 * @throws {UnauthorizedException} 401 if the user is not authenticated.
 */
export const POST = createApiRoute(async ({ cookies }) => {
	const user = await verifyAuth(cookies);

	await db.transaction(async (tx) => await updateStats(tx, user.id));
	return noContentResponse();
});
