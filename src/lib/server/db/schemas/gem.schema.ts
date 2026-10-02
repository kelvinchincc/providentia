import { generateCurrentTimestamp } from '$lib/server/utils/datetime';
import { randomUUIDv7 } from 'crypto';
import dayjs from 'dayjs';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const gem = sqliteTable('gems', {
	id: text('id').primaryKey().$defaultFn(randomUUIDv7),
	amount: integer('amount').notNull().default(0),
	obtainedAt: integer('obtained_at').notNull().$defaultFn(generateCurrentTimestamp),
	updatedAt: integer('updated_at').notNull().$defaultFn(generateCurrentTimestamp),
	note: text('note'),
	type: text('type').notNull(),
});
