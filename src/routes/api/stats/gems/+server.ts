/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { NULL_UUID } from '#lib/constants/values.js';
import { BadRequestException } from '#lib/exception/http/bad-request-exception.js';
import { InternalServerErrorException } from '#lib/exception/http/internal-server-error-exception.js';
import { NotFoundException } from '#lib/exception/http/not-found-exception.js';
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

/**
 * Lists the authenticated user's gem history using keyset pagination.
 *
 * Items are ordered newest first by `id`. The `from` cursor is inclusive. One extra row is
 * fetched to set `haveMore`. `next` is the cursor for the following page, or `NULL_UUID` when
 * there are no more pages.
 *
 * @param event - The request event provided by `createApiRoute`.
 * @param event.cookies - Cookies used to verify the access token.
 * @param event.url - Query parameters: `from` (optional cursor gem id) and `limit` (page size,
 * default 10).
 * @returns A 200 response with `list`, `haveMore` and `next`.
 * @throws {UnauthorizedException} 401 if the user is not authenticated.
 * @throws {InternalServerErrorException} 500 if the rows do not match the expected schema.
 */
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

/**
 * Logs a new gem and adds its amount to the user's stats.
 *
 * The insert and stat update run in one transaction.
 *
 * @param event - The request event provided by `createApiRoute`.
 * @param event.cookies - Cookies used to verify the access token.
 * @param event.request - Incoming request whose JSON body matches `LogGemApiRequest`.
 * @returns A 204 No Content response on success.
 * @throws {UnauthorizedException} 401 if the user is not authenticated.
 * @throws {BadRequestException} 400 if the JSON cannot be parsed or the body fails validation.
 */
export const POST = createApiRoute(async ({ cookies, request }) => {
	const user = await verifyAuth(cookies);

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

/**
 * Updates one of the authenticated user's gems and adjusts the stats to match.
 *
 * Fields omitted from the body keep their current value. A type change moves the amount between
 * the free and paid totals. The update runs in one transaction.
 *
 * @param event - The request event provided by `createApiRoute`.
 * @param event.cookies - Cookies used to verify the access token.
 * @param event.request - Incoming request whose JSON body matches `UpdateGemSchema`.
 * @returns A 204 No Content response on success.
 * @throws {UnauthorizedException} 401 if the user is not authenticated.
 * @throws {BadRequestException} 400 if the body fails schema validation.
 * @throws {NotFoundException} 404 if no gem owned by the user matches `id`.
 */
export const PUT = createApiRoute(async ({ cookies, request }) => {
	const user = await verifyAuth(cookies);

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

/**
 * Deletes one of the authenticated user's gems and removes its amount from the stats.
 *
 * The delete and stat update run in one transaction, so a failed delete leaves the stats
 * unchanged.
 *
 * @param event - The request event provided by `createApiRoute`.
 * @param event.cookies - Cookies used to verify the access token.
 * @param event.url - Request URL whose `id` query parameter names the gem to delete.
 * @returns A 204 No Content response on success.
 * @throws {UnauthorizedException} 401 if the user is not authenticated.
 * @throws {BadRequestException} 400 if the `id` query parameter is missing.
 * @throws {NotFoundException} 404 if no gem owned by the user matches `id`.
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
