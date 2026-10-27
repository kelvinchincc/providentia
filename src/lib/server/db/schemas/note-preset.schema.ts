/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { randomUUIDv7 } from 'crypto';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { user } from './user.schema';
import { generateCurrentTimestamp } from '#lib/server/utils/datetime.js';

export const notePreset = sqliteTable(
	'note_presets',
	{
		id: text('id').primaryKey().$defaultFn(randomUUIDv7),
		userId: text('user_id')
			.notNull()
			.references(() => user.id),
		name: text('name').notNull(),
		content: text('content').notNull(),
		createdAt: integer('created_at').notNull().$defaultFn(generateCurrentTimestamp),
		updatedAt: integer('updated_at').notNull().$defaultFn(generateCurrentTimestamp)
	},
	(table) => [index('idx_note_presets_userid_name').on(table.userId, table.name)]
);
