/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { generateCurrentTimestamp } from '#lib/server/utils/datetime.js';
import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { user } from './user.schema';
import { randomUUIDv7 } from 'crypto';

export const forcast = sqliteTable(
	'forcasts',
	{
		id: text('id').primaryKey().$defaultFn(randomUUIDv7),
		userId: text('user_id')
			.notNull()
			.references(() => user.id),
		createdAt: integer('created_at').notNull().$defaultFn(generateCurrentTimestamp),
		updatedAt: integer('updated_at').notNull().$defaultFn(generateCurrentTimestamp),
		targetDate: integer('target_date').notNull(),
		name: text('name').notNull()
	},
	(table) => [
		// Sort by targetDate ascending, then by updatedAt descending
		index('forcasts_target_date_updated_at_idx').on(
			table.targetDate,
			sql`${table.updatedAt} desc`
		)
	]
);
