/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
export const COOKIE_OPTIONS = {
	AUTH_COOKIE: 'auth',
	REFRESH_COOKIE: 'refresh'
};

export const AUTH_COOKIE_TTL = '1h'; // 1 hour
export const REFRESH_COOKIE_TTL = '7d'; // 7 days
export const AUTH_COOKIE_TTL_MS = 60 * 60 * 1000; // 1 hour in milliseconds
export const REFRESH_COOKIE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
