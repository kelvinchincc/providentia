/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '#lib/server/db/schemas/index.js';
import { DATABASE_URL } from '$app/env/private';
import { createClient } from '@libsql/client';

if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = createClient({ url: DATABASE_URL });
export const db = drizzle(client, { schema });
