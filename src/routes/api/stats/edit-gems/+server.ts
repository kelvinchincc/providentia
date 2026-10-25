/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { BadRequestException } from '#lib/exception/http/bad-request-exception.js';
import { UnauthorizedException } from '#lib/exception/http/unauthorized-exception.js';
import { updateGemSchema, type UpdateGemSchema } from '#lib/schema/api/update-gem.js';
import { db } from '#lib/server/db/index.js';
import { gem } from '#lib/server/db/schemas/gem.schema.js';
import { updateStats } from '#lib/server/services/stats.service.js';
import { createApiRoute, noContentResponse } from '#lib/server/utils/api.js';
import { verifyAuth } from '#lib/server/utils/auth.js';
import dayjs from 'dayjs';
import { and, eq } from 'drizzle-orm';

export const PUT = createApiRoute(async ({ cookies, request }) => {
	const user = await verifyAuth(cookies);
	const body: UpdateGemSchema = await request.json();

	try {
		updateGemSchema.parse(body);
	} catch (error) {
		throw new BadRequestException('Invalid request body');
	}

	if (!user) throw new UnauthorizedException();

	await db
		.update(gem)
		.set({
			amount: body.amount,
			updatedAt: dayjs().unix(),
			type: body.type,
			note: body.note
		})
		.where(and(eq(gem.userId, user.id), eq(gem.id, body.id)));
	await updateStats(user.id);
	return noContentResponse();
});
