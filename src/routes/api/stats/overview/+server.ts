/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { StatKey } from '#lib/constants/stat-key.js';
import { overviewSchema, type Overview } from '#lib/schema/api/overview.js';
import { db } from '#lib/server/db/index.js';
import { stat } from '#lib/server/db/schemas/stat.schema.js';
import { createApiRoute, okResponse } from '#lib/server/utils/api.js';
import { verifyAuth } from '#lib/server/utils/auth.js';
import { and, eq } from 'drizzle-orm';
import { PULL_PRICE } from '$app/env/public';
import { createOkApiResponse } from '#lib/schema/api/base.js';
import { DAILY_AVERAGE_GEMS_OBTAINED } from '#lib/constants/static.js';

/**
 * Returns the authenticated user's gem totals, averages and pull count.
 *
 * @param event - The request event provided by `createApiRoute`.
 * @param event.cookies - Cookies used to verify the access token.
 * @returns A 200 response with free, paid and total gems, monthly and linear averages, and the
 * pull count.
 * @throws {UnauthorizedException} 401 if the user is not authenticated.
 */
export const GET = createApiRoute(async ({ cookies }) => {
	const user = await verifyAuth(cookies);

	return okResponse(createOkApiResponse(overviewSchema, await getOverview(user.id)));
});

/**
 * Reads the stored gem totals and monthly average for a user, and computes the pull count.
 *
 * @param userId - ID of the user whose stats are read.
 * @returns The overview with free, paid and total gems, averages, and pull count.
 */
async function getOverview(userId: string): Promise<Overview> {
	const [totalGems, totalFree, totalPaid, monthlyAvg] = await Promise.all([
		db
			.select()
			.from(stat)
			.where(and(eq(stat.userId, userId), eq(stat.item, StatKey.TOTAL_GEMS)))
			.limit(1),
		db
			.select()
			.from(stat)
			.where(and(eq(stat.userId, userId), eq(stat.item, StatKey.TOTAL_FREE_GEMS)))
			.limit(1),
		db
			.select()
			.from(stat)
			.where(and(eq(stat.userId, userId), eq(stat.item, StatKey.TOTAL_PAID_GEMS)))
			.limit(1),
		db
			.select()
			.from(stat)
			.where(and(eq(stat.userId, userId), eq(stat.item, StatKey.MONTHLY_AVG_GAINS)))
			.limit(1)
	]);

	const totalGemsValue = totalGems[0]?.value ?? 0;
	const totalPulls = Math.floor(totalGemsValue / PULL_PRICE);

	return {
		free: totalFree[0]?.value ?? 0,
		paid: totalPaid[0]?.value ?? 0,
		total: totalGemsValue,
		monthlyAvg: monthlyAvg[0]?.value ?? 0,
		linearAvg: DAILY_AVERAGE_GEMS_OBTAINED,
		pullCount: totalPulls
	};
}
