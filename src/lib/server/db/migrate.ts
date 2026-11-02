/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { migrate } from 'drizzle-orm/libsql/migrator';
import { db } from '#lib/server/db/index.js';
import { logger } from '#lib/server/utils/logger.js';

/**
 * Apply pending SQL migrations from `./drizzle`. Already-applied migrations are skipped.
 * Relative path resolves against the working directory (`/app` in the container).
 *
 * @returns Resolves once all pending migrations are applied.
 * @throws {Error} If a migration fails to apply.
 */
export async function runMigrations(): Promise<void> {
	try {
		await migrate(db, { migrationsFolder: './drizzle' });
		logger.info('Database migrations applied.');
	} catch (error) {
		logger.error(
			'Database migration failed: ' + (error instanceof Error ? error.message : String(error))
		);
		throw error;
	}
}
