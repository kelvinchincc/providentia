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
	createForecastPayloadSchema,
	createForecastResponseSchema
} from '#lib/schema/api/create-forecast.js';
import {
	forecastItemsSchema,
	type ForecastItems,
	type ForecastTargetHit
} from '#lib/schema/api/get-forecasts.js';
import { updateForecastPayloadSchema } from '#lib/schema/api/update-forecast.js';
import { db } from '#lib/server/db/index.js';
import { forecast } from '#lib/server/db/schemas/forecast.schema.js';
import { createApiRoute, noContentResponse, okResponse } from '#lib/server/utils/api.js';
import { verifyAuth } from '#lib/server/utils/auth.js';
import { generateCurrentTimestamp } from '#lib/server/utils/datetime.js';
import { logger } from '#lib/server/utils/logger.js';
import dayjs from 'dayjs';
import { and, asc, eq } from 'drizzle-orm';
import { DAILY_AVERAGE_GEMS_OBTAINED } from '#lib/constants/static.js';
import { stat } from '#lib/server/db/schemas/stat.schema.js';
import { StatKey } from '#lib/constants/stat-key.js';
import { PULL_PRICE, WORST_CASE_PULLS, MAX_COPIES, BUFFER_FACTOR } from '$app/env/public';

const TARGET_PULL_AMOUNT = WORST_CASE_PULLS * MAX_COPIES;
const TARGET_PULL_PRICE = PULL_PRICE * TARGET_PULL_AMOUNT;
const SAFE_PULL_PRICE = TARGET_PULL_PRICE * BUFFER_FACTOR;

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
		.from(forecast)
		.where(eq(forecast.userId, user.id))
		.orderBy(asc(forecast.targetDate));
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
	const mapped: ForecastItems = result.map((itr) => {
		const hadPassed = today.unix() > itr.targetDate;
		const newLinearAverage = hadPassed
			? 0
			: Math.floor(
					DAILY_AVERAGE_GEMS_OBTAINED *
						(dayjs.unix(itr.targetDate).diff(today, 'days') + 1)
				) + currentTotal;
		const newMonthlyAverage = hadPassed
			? 0
			: Math.floor(monthlyAverage * (dayjs.unix(itr.targetDate).diff(today, 'days') + 1)) +
				currentTotal;

		const targetCheck = (value: number): ForecastTargetHit => {
			if (value >= SAFE_PULL_PRICE) return 'safe';
			if (value >= TARGET_PULL_PRICE) return 'hit';
			return 'no';
		};

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
					targetHit: targetCheck(newLinearAverage)
				},
				monthlyAvg: {
					amount: newMonthlyAverage,
					pull: Math.floor(newMonthlyAverage / PULL_PRICE),
					targetHit: targetCheck(newMonthlyAverage)
				}
			},
			createdAt: itr.createdAt,
			updatedAt: itr.updatedAt,
			hadPassed
		};
	});

	return okResponse(createOkApiResponse(forecastItemsSchema, mapped));
});

export const POST = createApiRoute(async ({ cookies, request }) => {
	const user = await verifyAuth(cookies);
	const body = createForecastPayloadSchema.safeParse(await request.json());

	if (!user) throw new UnauthorizedException();
	if (!body.success) throw new BadRequestException('Invalid request body');
	const today = dayjs();
	const target = dayjs.unix(body.data.targetDate);

	if (target.isBefore(today)) throw new BadRequestException('Target date must be in the future');

	const result = await db
		.insert(forecast)
		.values({
			name: body.data.name,
			targetDate: body.data.targetDate,
			userId: user.id
		})
		.returning();

	if (result.length === 0) throw new BadRequestException('Failed to create forecast');

	return okResponse(createOkApiResponse(createForecastResponseSchema, { id: result[0].id }), 201);
});

export const PUT = createApiRoute(async ({ cookies, request }) => {
	const user = await verifyAuth(cookies);
	const body = updateForecastPayloadSchema.safeParse(await request.json());

	if (!user) throw new UnauthorizedException();
	if (!body.success) {
		logger.error(`Invalid request body: ${JSON.stringify({ cause: body.error })}`);
		throw new BadRequestException('Invalid request body');
	}

	await db.transaction(async (tx) => {
		const rows = await tx
			.update(forecast)
			.set({
				name: body.data.name,
				targetDate: body.data.targetDate,
				updatedAt: generateCurrentTimestamp()
			})
			.where(and(eq(forecast.userId, user.id), eq(forecast.id, body.data.id)))
			.returning();

		if (rows.length === 0) {
			throw new NotFoundException(
				'Forecast not found or you do not have permission to update it'
			);
		} else if (rows.length > 1) {
			throw new BadRequestException('Multiple forecasts found with the same id');
		}
	});

	return noContentResponse();
});

export const DELETE = createApiRoute(async ({ cookies, url }) => {
	const user = await verifyAuth(cookies);
	const id = url.searchParams.get('id');

	if (!user) throw new UnauthorizedException();
	if (!id) throw new BadRequestException('Missing forecast id');

	const result = await db
		.delete(forecast)
		.where(and(eq(forecast.userId, user.id), eq(forecast.id, id)))
		.returning();

	if (result.length === 0) {
		throw new NotFoundException(
			'Forecast not found or you do not have permission to delete it'
		);
	}

	return noContentResponse();
});
