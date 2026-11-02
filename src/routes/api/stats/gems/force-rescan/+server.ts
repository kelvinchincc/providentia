/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { UnauthorizedException } from '#lib/exception/http/unauthorized-exception.js';
import { db } from '#lib/server/db/index.js';
import { updateStats } from '#lib/server/services/stats.service.js';
import { createApiRoute, noContentResponse } from '#lib/server/utils/api.js';
import { verifyAuth } from '#lib/server/utils/auth.js';

export const POST = createApiRoute(async ({ cookies }) => {
	const user = await verifyAuth(cookies);
	if (!user) throw new UnauthorizedException();

	await db.transaction(async (tx) => await updateStats(tx, user.id));
	return noContentResponse();
});
