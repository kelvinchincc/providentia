/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { BadRequestException } from '#lib/exception/http/bad-request-exception.js';
import { NotFoundException } from '#lib/exception/http/not-found-exception.js';
import { UnauthorizedException } from '#lib/exception/http/unauthorized-exception.js';
import { createOkApiResponse } from '#lib/schema/api/base.js';
import {
	createForcastPayloadSchema,
	createForcastResponseSchema
} from '#lib/schema/api/create-forcast.js';
import { forcastItemsSchema, type ForcastItems } from '#lib/schema/api/get-forcasts.js';
import { updateForcastPayloadSchema } from '#lib/schema/api/update-forcast.js';
import { db } from '#lib/server/db/index.js';
import { forcast } from '#lib/server/db/schemas/forcast.schema.js';
import { createApiRoute, noContentResponse, okResponse } from '#lib/server/utils/api.js';
import { verifyAuth } from '#lib/server/utils/auth.js';
import { generateCurrentTimestamp } from '#lib/server/utils/datetime.js';
import { logger } from '#lib/server/utils/logger.js';
import dayjs from 'dayjs';
import { and, asc, eq } from 'drizzle-orm';
import { DAILY_AVERAGE_GEMS_OBTAINED } from '#lib/constants/static.js';
import { stat } from '#lib/server/db/schemas/stat.schema.js';
import { StatKey } from '#lib/constants/stat-key.js';
import { PULL_PRICE, WORST_CASE_PULLS, MAX_COPIES } from '$app/env/public';

const TARGET_PULL_AMOUNT = WORST_CASE_PULLS * MAX_COPIES;
const TARGET_PULL_PRICE = PULL_PRICE * TARGET_PULL_AMOUNT;

export const GET = createApiRoute(async ({ cookies }) => {
	const user = await verifyAuth(cookies);
	if (!user) throw new UnauthorizedException();

	const monthlyAverage = await (async () => {
		const result = await db
			.select()
			.from(stat)
			.where(and(eq(stat.userId, user.id), eq(stat.item, StatKey.MONTHLY_AVG_GAINS)))
			.limit(1);
		if (result.length <= 0) return 0;
		return result[0].value || 0;
	})();
	const result = await db
		.select()
		.from(forcast)
		.where(eq(forcast.userId, user.id))
		.orderBy(asc(forcast.targetDate));
	const currentTotal = await (async () => {
		const result = await db
			.select()
			.from(stat)
			.where(and(eq(stat.userId, user.id), eq(stat.item, StatKey.TOTAL_GEMS)))
			.limit(1);
		if (result.length <= 0) return 0;
		return result[0].value || 0;
	})();
	// today, at 00:00:00, in UTC
	const today = dayjs().startOf('day');
	const mapped: ForcastItems = result.map((itr) => {
		const newLinearAverage =
			Math.floor(
				DAILY_AVERAGE_GEMS_OBTAINED * (dayjs.unix(itr.targetDate).diff(today, 'days') + 1)
			) + currentTotal;
		const newMonthlyAverage =
			Math.floor(monthlyAverage * (dayjs.unix(itr.targetDate).diff(today, 'days') + 1)) +
			currentTotal;

		return {
			id: itr.id,
			name: itr.name,
			targetDate: itr.targetDate,
			targetAmount: TARGET_PULL_PRICE,
			targetPull: TARGET_PULL_AMOUNT,
			expected: {
				linear: {
					amount: newLinearAverage,
					pull: Math.floor(newLinearAverage / PULL_PRICE),
					targetHit:
						newLinearAverage > TARGET_PULL_PRICE
							? 'safe'
							: newLinearAverage === TARGET_PULL_PRICE
								? 'hit'
								: 'no'
				},
				monthlyAvg: {
					amount: newMonthlyAverage,
					pull: Math.floor(newMonthlyAverage / PULL_PRICE),
					targetHit:
						newMonthlyAverage > TARGET_PULL_PRICE
							? 'safe'
							: newMonthlyAverage === TARGET_PULL_PRICE
								? 'hit'
								: 'no'
				}
			},
			createdAt: itr.createdAt,
			updatedAt: itr.updatedAt
		};
	});

	return okResponse(createOkApiResponse(forcastItemsSchema, mapped));
});

export const POST = createApiRoute(async ({ cookies, request }) => {
	const user = await verifyAuth(cookies);
	const body = createForcastPayloadSchema.safeParse(await request.json());

	if (!user) throw new UnauthorizedException();
	if (!body.success) throw new BadRequestException('Invalid request body');
	const today = dayjs();
	const target = dayjs.unix(body.data.targetDate);

	if (target.isBefore(today)) throw new BadRequestException('Target date must be in the future');

	const result = await db
		.insert(forcast)
		.values({
			name: body.data.name,
			targetDate: body.data.targetDate,
			userId: user.id
		})
		.returning();

	if (result.length === 0) throw new BadRequestException('Failed to create forcast');

	return okResponse(createOkApiResponse(createForcastResponseSchema, { id: result[0].id }), 201);
});

export const PUT = createApiRoute(async ({ cookies, request }) => {
	const user = await verifyAuth(cookies);
	const body = updateForcastPayloadSchema.safeParse(await request.json());

	if (!user) throw new UnauthorizedException();
	if (!body.success) {
		logger.error(`Invalid request body: ${JSON.stringify({ cause: body.error })}`);
		throw new BadRequestException('Invalid request body');
	}

	await db.transaction(async (tx) => {
		const rows = await tx
			.update(forcast)
			.set({
				name: body.data.name,
				targetDate: body.data.targetDate,
				updatedAt: generateCurrentTimestamp()
			})
			.where(and(eq(forcast.userId, user.id), eq(forcast.id, body.data.id)))
			.returning();

		if (rows.length === 0) {
			throw new NotFoundException(
				'Forcast not found or you do not have permission to update it'
			);
		} else if (rows.length > 1) {
			throw new BadRequestException('Multiple forcasts found with the same id');
		}
	});

	return noContentResponse();
});

export const DELETE = createApiRoute(async ({ cookies, url }) => {
	const user = await verifyAuth(cookies);
	const id = url.searchParams.get('id');

	if (!user) throw new UnauthorizedException();
	if (!id) throw new BadRequestException('Missing forcast id');

	const result = await db
		.delete(forcast)
		.where(and(eq(forcast.userId, user.id), eq(forcast.id, id)))
		.returning();

	if (result.length === 0) {
		throw new NotFoundException('Forcast not found or you do not have permission to delete it');
	}

	return noContentResponse();
});
