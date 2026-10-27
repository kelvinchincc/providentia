/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { generateCurrentTimestamp } from '#lib/server/utils/datetime.js';
import { randomUUIDv7 } from 'crypto';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { user } from './user.schema';

export const gem = sqliteTable(
	'gems',
	{
		id: text('id').primaryKey().$defaultFn(randomUUIDv7),
		userId: text('user_id')
			.notNull()
			.references(() => user.id),
		amount: integer('amount').notNull().default(0),
		obtainedAt: integer('obtained_at').notNull().$defaultFn(generateCurrentTimestamp),
		updatedAt: integer('updated_at').notNull().$defaultFn(generateCurrentTimestamp),
		note: text('note'),
		type: text('type').notNull()
	},
	(table) => [
		index('idx_gems_userid_amount').on(table.userId, table.amount),
		index('idx_gems_userid_obtained_at').on(table.userId, table.obtainedAt, table.amount)
	]
);
