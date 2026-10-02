import { generateCurrentTimestamp } from '$lib/server/utils/datetime';
import { randomUUIDv7 } from 'crypto';
import dayjs from 'dayjs';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable(
	'users',
	{
		id: text('id').primaryKey().$defaultFn(randomUUIDv7),
		username: text('username').notNull(),
		passwordHash: text('password_hash').notNull(),
		jwtSeed: text('jwt_seed').notNull(),
		refreshTokenSeed: text('refresh_token_seed').notNull(),
		createdAt: integer('created_at').notNull().$defaultFn(generateCurrentTimestamp),
		updatedAt: integer('updated_at').notNull().$defaultFn(generateCurrentTimestamp),
	},
	(table) => [index('username_idx').on(table.username)]
);
