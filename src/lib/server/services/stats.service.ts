/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { and, eq, gte, sum } from 'drizzle-orm';
import { db } from '../db';
import { gem, stat } from '../db/schemas';
import { GemType } from '#lib/constants/gem-type.js';
import { StatKey } from '#lib/constants/stat-key.js';
import { logger } from '../utils/logger';
import dayjs from 'dayjs';

/**
 * Full table scans to update the stats of gems.
 * @param userId User to update the stats.
 */
export async function updateStats(userId: string) {
	logger.info(`Updating stats for user ${userId}`);
	const [totalFree, totalPaid] = await Promise.all([
		db
			.select({ total: sum(gem.amount).mapWith(Number) })
			.from(gem)
			.where(and(eq(gem.userId, userId), eq(gem.type, GemType.FREE))),
		db
			.select({ total: sum(gem.amount).mapWith(Number) })
			.from(gem)
			.where(and(eq(gem.userId, userId), eq(gem.type, GemType.PAID)))
	]);

	const totalGems = (totalFree[0]?.total || 0) + (totalPaid[0]?.total || 0);

	// if have stat record, update it, otherwise create a new one
	const [
		extFreeGemsStat,
		extPaidGemsStat,
		extTotalGemsStat,
		extAverageGemsStat,
		extLinearGainsStat,
		newMonthlyAvg
	] = await Promise.all([
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
			.where(and(eq(stat.userId, userId), eq(stat.item, StatKey.TOTAL_GEMS)))
			.limit(1),
		db
			.select()
			.from(stat)
			.where(and(eq(stat.userId, userId), eq(stat.item, StatKey.MONTHLY_AVG_GAINS)))
			.limit(1),
		db
			.select()
			.from(stat)
			.where(and(eq(stat.userId, userId), eq(stat.item, StatKey.LINEAR_GAINS)))
			.limit(1),
		db
			.select({ total: sum(gem.amount).mapWith(Number) })
			.from(gem)
			.where(
				and(eq(gem.userId, userId), gte(gem.obtainedAt, dayjs().subtract(30, 'day').unix()))
			)
	]);

	await db.transaction(async (tx) => {
		if (extFreeGemsStat.length > 0) {
			await tx
				.update(stat)
				.set({ value: totalFree[0]?.total || 0 })
				.where(and(eq(stat.userId, userId), eq(stat.item, StatKey.TOTAL_FREE_GEMS)));
		} else {
			await tx.insert(stat).values({
				userId,
				item: StatKey.TOTAL_FREE_GEMS,
				value: totalFree[0]?.total || 0
			});
		}

		if (extPaidGemsStat.length > 0) {
			await tx
				.update(stat)
				.set({ value: totalPaid[0]?.total || 0 })
				.where(and(eq(stat.userId, userId), eq(stat.item, StatKey.TOTAL_PAID_GEMS)));
		} else {
			await tx.insert(stat).values({
				userId,
				item: StatKey.TOTAL_PAID_GEMS,
				value: totalPaid[0]?.total || 0
			});
		}

		if (extTotalGemsStat.length > 0) {
			await tx
				.update(stat)
				.set({ value: totalGems })
				.where(and(eq(stat.userId, userId), eq(stat.item, StatKey.TOTAL_GEMS)));
		} else {
			await tx.insert(stat).values({
				userId,
				item: StatKey.TOTAL_GEMS,
				value: totalGems
			});
		}

		const dailyGains = Math.round((newMonthlyAvg[0]?.total || 0) / 30);
		if (extLinearGainsStat.length > 0) {
			await tx
				.update(stat)
				.set({ value: dailyGains })
				.where(and(eq(stat.userId, userId), eq(stat.item, StatKey.MONTHLY_AVG_GAINS)));
		} else {
			await tx.insert(stat).values({
				userId,
				item: StatKey.LINEAR_GAINS,
				value: dailyGains
			});
		}
	});
}
