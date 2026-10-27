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

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Full table scans to update the stats of gems.
 * @param userId User to update the stats.
 */
export async function updateStats(tx: Transaction, userId: string) {
	logger.info(`Updating stats for user ${userId}`);
	const [totalFree, totalPaid] = await Promise.all([
		// Get total free gems and total paid gems
		tx
			.select({ total: sum(gem.amount).mapWith(Number) })
			.from(gem)
			.where(and(eq(gem.userId, userId), eq(gem.type, GemType.FREE))),
		// Get total paid gems
		tx
			.select({ total: sum(gem.amount).mapWith(Number) })
			.from(gem)
			.where(and(eq(gem.userId, userId), eq(gem.type, GemType.PAID)))
	]);

	const totalGems = (totalFree[0]?.total || 0) + (totalPaid[0]?.total || 0);

	// if have stat record, update it, otherwise create a new one
	const [extFreeGemsStat, extPaidGemsStat, extTotalGemsStat, extAverageGemsStat, newMonthlyAvg] =
		await Promise.all([
			// Get existing stats for free gems
			tx
				.select()
				.from(stat)
				.where(and(eq(stat.userId, userId), eq(stat.item, StatKey.TOTAL_FREE_GEMS)))
				.limit(1),
			// Get existing stats for paid gems
			tx
				.select()
				.from(stat)
				.where(and(eq(stat.userId, userId), eq(stat.item, StatKey.TOTAL_PAID_GEMS)))
				.limit(1),
			// Get existing stats for total gems
			tx
				.select()
				.from(stat)
				.where(and(eq(stat.userId, userId), eq(stat.item, StatKey.TOTAL_GEMS)))
				.limit(1),
			// Get existing stats for monthly average gains
			tx
				.select()
				.from(stat)
				.where(and(eq(stat.userId, userId), eq(stat.item, StatKey.MONTHLY_AVG_GAINS)))
				.limit(1),
			// Get total gems obtained in the last 30 days
			tx
				.select({ total: sum(gem.amount).mapWith(Number) })
				.from(gem)
				.where(
					and(
						eq(gem.userId, userId),
						gte(gem.obtainedAt, dayjs().subtract(30, 'day').unix())
					)
				)
		]);
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
	if (extAverageGemsStat.length > 0) {
		await tx
			.update(stat)
			.set({ value: dailyGains })
			.where(and(eq(stat.userId, userId), eq(stat.item, StatKey.MONTHLY_AVG_GAINS)));
	} else {
		await tx.insert(stat).values({
			userId,
			item: StatKey.MONTHLY_AVG_GAINS,
			value: dailyGains
		});
	}
}

type LazyUpdateStatsParams = {
	userId: string;
	/** Gem changes to apply. Removed gems use a negative amount. */
	changes: { type: string; amount: number }[];
};

/**
 * Lazy update stats for a user. This function is used to update the stats of a user without doing a full table scan.
 * This should be called as primary method to update stats, and if the stats are not found, {@link updateStats} will be
 * called as fallback.
 *
 * @param params The parameters for the lazy update stats function.
 */
export async function lazyUpdateStats(tx: Transaction, params: LazyUpdateStatsParams) {
	const queries = await Promise.all([
		tx
			.select()
			.from(stat)
			.where(and(eq(stat.userId, params.userId), eq(stat.item, StatKey.TOTAL_GEMS))),
		tx
			.select()
			.from(stat)
			.where(and(eq(stat.userId, params.userId), eq(stat.item, StatKey.TOTAL_FREE_GEMS))),
		tx
			.select()
			.from(stat)
			.where(and(eq(stat.userId, params.userId), eq(stat.item, StatKey.TOTAL_PAID_GEMS))),
		tx
			.select()
			.from(stat)
			.where(and(eq(stat.userId, params.userId), eq(stat.item, StatKey.MONTHLY_AVG_GAINS)))
	]);

	const shallPerformFullUpdate = queries.some((query) => query.length === 0);
	if (shallPerformFullUpdate) {
		logger.info(
			`Stats not found for user ${params.userId}, performing full update instead of lazy update`
		);
		await updateStats(tx, params.userId);
		return;
	}

	const newMonthlyAvg = await tx
		.select({ total: sum(gem.amount).mapWith(Number) })
		.from(gem)
		.where(
			and(
				eq(gem.userId, params.userId),
				gte(gem.obtainedAt, dayjs().subtract(30, 'day').unix())
			)
		);

	const dailyGains = Math.round((newMonthlyAvg[0]?.total || 0) / 30);

	// Sum the changes per gem type, so one call can move an amount from free to paid
	let freeDelta = 0;
	let paidDelta = 0;
	for (const change of params.changes) {
		if (change.type === GemType.FREE) freeDelta += change.amount;
		else paidDelta += change.amount;
	}

	await Promise.all([
		// Update total gems
		tx
			.update(stat)
			.set({ value: queries[0][0].value + freeDelta + paidDelta })
			.where(and(eq(stat.userId, params.userId), eq(stat.item, StatKey.TOTAL_GEMS))),
		// Update total free gems
		tx
			.update(stat)
			.set({ value: queries[1][0].value + freeDelta })
			.where(and(eq(stat.userId, params.userId), eq(stat.item, StatKey.TOTAL_FREE_GEMS))),
		// Update total paid gems
		tx
			.update(stat)
			.set({ value: queries[2][0].value + paidDelta })
			.where(and(eq(stat.userId, params.userId), eq(stat.item, StatKey.TOTAL_PAID_GEMS))),
		// Update monthly average gains
		tx
			.update(stat)
			.set({ value: dailyGains })
			.where(and(eq(stat.userId, params.userId), eq(stat.item, StatKey.MONTHLY_AVG_GAINS)))
	]);
}
