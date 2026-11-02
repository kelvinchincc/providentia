/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { db } from '#lib/server/db/index.js';
import { runMigrations } from '#lib/server/db/migrate.js';
import { needInitializationCheck } from '#lib/server/utils/healthcheck.js';
import { logger } from '#lib/server/utils/logger.js';
import { dev } from '$app/env';
import { APP_URL } from '$app/env/private';
import { redirect } from '@sveltejs/kit';
import type { Handle, ServerInit } from '@sveltejs/kit/hooks';
import { sql } from 'drizzle-orm';

const JOURNAL_MODE: 'WAL' | 'DELETE' = 'WAL';

/**
 * Set SQLite journal mode to WAL (persistent per database file), then run pending
 * DB migrations once at startup in production. In dev, migrate manually with drizzle-kit.
 *
 * @throws {Error} If journal mode cannot be set to WAL or migrations fail.
 *   The server will not serve requests on a half-configured DB.
 */
export const init: ServerInit = async () => {
	if (!dev) {
		await runMigrations();
	}

	const [row] = await db.all<{ journal_mode: string }>(
		sql.raw(`PRAGMA journal_mode = ${JOURNAL_MODE}`)
	);
	logger.info(`PRAGMA journal_mode: ${row?.journal_mode}`);

	const modeRegex = new RegExp(`^${JOURNAL_MODE}$`, 'gmi');
	if (!modeRegex.test(row?.journal_mode)) {
		throw new Error(`Failed to set journal_mode to ${JOURNAL_MODE}, got: ${row?.journal_mode}`);
	}
};

export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname === '/setup') return resolve(event);
	// Skip healthcheck for static assets (e.g., .js, .css, .png, etc.)
	if (event.url.pathname.split('.').length > 1) return resolve(event);

	// Skip healthcheck for API routes
	if (event.url.pathname.startsWith('/api')) return resolve(event);

	try {
		const needInitialization = await needInitializationCheck();
		if (needInitialization) {
			throw new Error('redirect-need-initialization');
		}
	} catch (error) {
		if (error instanceof Error && error.message === 'redirect-need-initialization') {
			logger.info('Redirecting to setup page due to uninitialized state.');
			throw redirect(301, `${APP_URL}/setup`);
		} else {
			logger.error(
				'Healthcheck failed: ' + (error instanceof Error ? error.message : String(error))
			);
			return new Response('Service Unavailable', { status: 503 });
		}
	}

	return resolve(event);
};
