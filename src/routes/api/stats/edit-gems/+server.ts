/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { BadRequestException } from '#lib/exception/http/bad-request-exception.js';
import { NotFoundException } from '#lib/exception/http/not-found-exception.js';
import { UnauthorizedException } from '#lib/exception/http/unauthorized-exception.js';
import { updateGemSchema, type UpdateGemSchema } from '#lib/schema/api/update-gem.js';
import { db } from '#lib/server/db/index.js';
import { gem } from '#lib/server/db/schemas/gem.schema.js';
import { lazyUpdateStats } from '#lib/server/services/stats.service.js';
import { createApiRoute, noContentResponse } from '#lib/server/utils/api.js';
import { verifyAuth } from '#lib/server/utils/auth.js';
import dayjs from 'dayjs';
import { and, eq } from 'drizzle-orm';

export const PUT = createApiRoute(async ({ cookies, request }) => {
	const user = await verifyAuth(cookies);

	if (!user) throw new UnauthorizedException();

	const body: UpdateGemSchema = await request.json();

	try {
		updateGemSchema.parse(body);
	} catch (_error) {
		throw new BadRequestException('Invalid request body');
	}

	await db.transaction(async (tx) => {
		const record = await tx
			.select()
			.from(gem)
			.where(and(eq(gem.userId, user.id), eq(gem.id, body.id)))
			.limit(1);

		if (record.length === 0) {
			throw new NotFoundException('Gem not found');
		}

		// Fields left out of the body keep their current value
		const newAmount = body.amount ?? record[0].amount;
		const newType = body.type ?? record[0].type;

		await tx
			.update(gem)
			.set({
				amount: newAmount,
				updatedAt: dayjs().unix(),
				type: newType,
				note: body.note
			})
			.where(and(eq(gem.userId, user.id), eq(gem.id, body.id)));

		// Remove the old amount from its type and add the new amount to its type,
		// so a type change moves the amount between free and paid
		await lazyUpdateStats(tx, {
			userId: user.id,
			changes: [
				{ type: record[0].type, amount: -record[0].amount },
				{ type: newType, amount: newAmount }
			]
		});
	});

	return noContentResponse();
});
