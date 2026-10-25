/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { BadRequestException } from '#lib/exception/http/bad-request-exception.js';
import { NotImplementedException } from '#lib/exception/http/not-implemented-exception.js';
import { UnauthorizedException } from '#lib/exception/http/unauthorized-exception.js';
import { db } from '#lib/server/db/index.js';
import { gem } from '#lib/server/db/schemas/gem.schema.js';
import { updateStats } from '#lib/server/services/stats.service.js';
import { createApiRoute, noContentResponse } from '#lib/server/utils/api.js';
import { verifyAuth } from '#lib/server/utils/auth.js';
import { and, eq } from 'drizzle-orm';

export const DELETE = createApiRoute(async ({ cookies, url }) => {
	const user = await verifyAuth(cookies);

	if (!user) {
		throw new UnauthorizedException();
	}

	const urlParams = new URLSearchParams(url.search);
	const id: string | null = urlParams.get('id');

	if (id === null) {
		throw new BadRequestException('Missing id parameter');
	}

	await db.delete(gem).where(and(eq(gem.userId, user.id), eq(gem.id, id)));
	await updateStats(user.id);
	return noContentResponse();
});
