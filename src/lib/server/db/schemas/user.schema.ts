/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { generateCurrentTimestamp } from '#lib/server/utils/datetime.js';
import { randomUUIDv7 } from 'crypto';
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
		updatedAt: integer('updated_at').notNull().$defaultFn(generateCurrentTimestamp)
	},
	(table) => [index('username_idx').on(table.username)]
);
