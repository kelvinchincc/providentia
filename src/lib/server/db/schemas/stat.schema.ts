import { generateCurrentTimestamp } from "$lib/server/utils/datetime";
import { randomUUIDv7 } from "crypto";
import dayjs from "dayjs";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const stat = sqliteTable(
	'stats',
	{
		id: text('id').primaryKey().$defaultFn(randomUUIDv7),
		item: text('item').notNull(),
		value: integer('value').notNull().default(0),
		createdAt: integer('created_at').notNull().$defaultFn(generateCurrentTimestamp),
		updatedAt: integer('updated_at').notNull().$defaultFn(generateCurrentTimestamp),
	}, table => [
		index("item_idx").on(table.item)
	])
