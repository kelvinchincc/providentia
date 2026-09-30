import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable(
	'users',
	{
		id: text('id').primaryKey(),
		username: text('username').notNull(),
		passwordHash: text('password_hash').notNull(),
		jwtSeed: text('jwt_seed').notNull(),
		refreshTokenSeed: text('refresh_token_seed').notNull()
	},
	(table) => [index('username_idx').on(table.username)]
);
