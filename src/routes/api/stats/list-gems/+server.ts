/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { NULL_UUID } from '#lib/constants/values.js';
import { InternalServerErrorException } from '#lib/exception/http/internal-server-error-exception.js';
import { createOkApiResponse } from '#lib/schema/api/base.js';
import {
	pagedGemHistoryArraySchema,
	type GemHistories,
	type PagedGemHistories
} from '#lib/schema/api/gem-history.js';
import { db } from '#lib/server/db/index.js';
import { gem } from '#lib/server/db/schemas/gem.schema.js';
import { createApiRoute, okResponse } from '#lib/server/utils/api.js';
import { verifyAuth } from '#lib/server/utils/auth.js';
import { logger } from '#lib/server/utils/logger.js';
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
