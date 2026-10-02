/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { redirect, type Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { logger } from '$lib/server/utils/logger';
import { needInitializationCheck } from '$lib/server/utils/healthcheck';

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
			throw redirect(301, `${env.DOMAIN}/setup`);
		} else {
			logger.error(
				'Healthcheck failed: ' + (error instanceof Error ? error.message : String(error))
			);
			return new Response('Service Unavailable', { status: 503 });
		}
	}

	return resolve(event);
};
