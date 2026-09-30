import { numeric, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const gem = sqliteTable('gems', {
	id: text('id').primaryKey(),
	amount: numeric('amount'),
	obtainedAt: text('obtained_at').notNull(),
	note: text('note'),
	type: text('type').notNull()
});
