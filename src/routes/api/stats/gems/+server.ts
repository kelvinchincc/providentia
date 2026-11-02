/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { NULL_UUID } from '#lib/constants/values.js';
import { BadRequestException } from '#lib/exception/http/bad-request-exception.js';
import { InternalServerErrorException } from '#lib/exception/http/internal-server-error-exception.js';
import { NotFoundException } from '#lib/exception/http/not-found-exception.js';
import { UnauthorizedException } from '#lib/exception/http/unauthorized-exception.js';
import { createOkApiResponse } from '#lib/schema/api/base.js';
import {
	pagedGemHistoryArraySchema,
	type GemHistories,
	type PagedGemHistories
} from '#lib/schema/api/gem-history.js';
import { logGemApiSchema, type LogGemApiRequest } from '#lib/schema/api/log-gems.js';
import { updateGemSchema, type UpdateGemSchema } from '#lib/schema/api/update-gem.js';
import { db } from '#lib/server/db/index.js';
import { gem } from '#lib/server/db/schemas/gem.schema.js';
import { lazyUpdateStats } from '#lib/server/services/stats.service.js';
import { createApiRoute, noContentResponse, okResponse } from '#lib/server/utils/api.js';
import { verifyAuth } from '#lib/server/utils/auth.js';
import { logger } from '#lib/server/utils/logger.js';
import dayjs from 'dayjs';
import { and, desc, eq, lte } from 'drizzle-orm';

export const GET = createApiRoute(async ({ url, cookies }) => {
	const user = await verifyAuth(cookies);

	const params = url.searchParams;
	const from: string | null = params.get('from');
	const limit: number = Number.parseInt(params.get('limit') ?? '10', 10);

	// Keyset pagination: uuidv7 ids sort by creation time, so descending id order
	// with `id <= from` returns the items older than the cursor. Fetch one extra row to detect more pages.
	const rows = await db
		.select()
		.from(gem)
		.where(and(eq(gem.userId, user.id), from ? lte(gem.id, from) : undefined))
		.orderBy(desc(gem.id))
		.limit(limit + 1);

	const haveMore = rows.length > limit;
	const nextCursor = haveMore ? rows[limit].id : NULL_UUID;
	const pagedResult: PagedGemHistories = {
		list: (haveMore ? rows.slice(0, limit) : rows) as GemHistories,
		haveMore,
		next: nextCursor
	};

	try {
		return okResponse(createOkApiResponse(pagedGemHistoryArraySchema, pagedResult));
	} catch (error) {
		logger.error(`Error creating OK API response: ${error}`);
		throw new InternalServerErrorException('Invalid gem history data from database');
	}
});

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

	await db.transaction(async (tx) => {
		const record = await tx
			.select()
			.from(gem)
			.where(and(eq(gem.userId, user.id), eq(gem.id, id)))
			.limit(1);
		const result = await tx.delete(gem).where(and(eq(gem.userId, user.id), eq(gem.id, id)));
		const affectedRows = result.rowsAffected || 0;
		if (affectedRows === 0) {
			throw new NotFoundException('Gem not found');
		}

		await lazyUpdateStats(tx, {
			userId: user.id,
			// Negative amount to indicate that we are removing gems from the total
			changes: [{ type: record[0]?.type || 'free', amount: -(record[0]?.amount || 0) }]
		});
	});
	return noContentResponse();
});
