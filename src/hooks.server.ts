import type { HealthcheckApiResponse } from '$lib/schema/api/healthcheck';
import { redirect, type Handle } from '@sveltejs/kit';
import axios from 'axios';
import { env } from '$env/dynamic/private';

export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname === '/setup') return resolve(event);
	// Skip healthcheck for static assets (e.g., .js, .css, .png, etc.)
	if (event.url.pathname.split('.').length > 1) return resolve(event);

	// Skip healthcheck for API routes
	if (event.url.pathname.startsWith('/api')) return resolve(event);

	try {
		const result = await axios.get<HealthcheckApiResponse>(`${env.DOMAIN}/api/healthcheck`);
		if (!result.data.success) {
			throw new Error('Healthcheck failed: ' + result.data.message);
		}

		if (!result.data.data.initialized) {
			throw new Error('redirect-need-initialization');
		}
	} catch (error) {
		if (error instanceof Error && error.message === 'redirect-need-initialization') {
			throw redirect(301, `${env.DOMAIN}/setup`);
		} else {
			console.error('Healthcheck failed:', error);
			return new Response('Service Unavailable', { status: 503 });
		}
	}

	return resolve(event);
};
