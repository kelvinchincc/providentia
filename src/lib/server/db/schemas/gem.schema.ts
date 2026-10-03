/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { generateCurrentTimestamp } from '#lib/server/utils/datetime.js';
import { randomUUIDv7 } from 'crypto';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const gem = sqliteTable('gems', {
	id: text('id').primaryKey().$defaultFn(randomUUIDv7),
	amount: integer('amount').notNull().default(0),
	obtainedAt: integer('obtained_at').notNull().$defaultFn(generateCurrentTimestamp),
	updatedAt: integer('updated_at').notNull().$defaultFn(generateCurrentTimestamp),
	note: text('note'),
	type: text('type').notNull()
});
