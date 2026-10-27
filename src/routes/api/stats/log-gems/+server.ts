/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { BadRequestException } from '#lib/exception/http/bad-request-exception.js';
import { UnauthorizedException } from '#lib/exception/http/unauthorized-exception.js';
import { logGemApiSchema, type LogGemApiRequest } from '#lib/schema/api/log-gems.js';
import { db } from '#lib/server/db/index.js';
import { gem } from '#lib/server/db/schemas/gem.schema.js';
import { createApiRoute, noContentResponse } from '#lib/server/utils/api.js';
import { verifyAuth } from '#lib/server/utils/auth.js';
import { logger } from '#lib/server/utils/logger.js';
import { lazyUpdateStats } from '#lib/server/services/stats.service.js';

export const POST = createApiRoute(async ({ cookies, request }) => {
	const user = await verifyAuth(cookies);

	if (!user) {
		throw new UnauthorizedException();
	}

	const body: LogGemApiRequest = await (async () => {
		try {
			return await request.json();
		} catch (error) {
			logger.debug('Error parsing request body:', error);
			throw new BadRequestException('Invalid JSON in request body');
		}
	})();

	try {
		logGemApiSchema.parse(body);
	} catch (_error) {
		throw new BadRequestException('Invalid request body');
	}

	await db.transaction(async (tx) => {
		await tx.insert(gem).values({
			userId: user.id,
			type: body.type,
			amount: body.amount,
			note: body.note
		});

		await lazyUpdateStats(tx, {
			userId: user.id,
			changes: [{ type: body.type, amount: body.amount }]
		});
	});

	return noContentResponse();
});
