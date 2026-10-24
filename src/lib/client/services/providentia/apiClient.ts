/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { authStoreActions } from '#lib/client/store/authStore.js';
import { authRefresh } from './apiRoutes';

export const client = axios.create();

let refreshTokenPromise: Promise<void> | null = null;

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// share one in-flight refresh across concurrent 401s
const refreshToken = () => {
	refreshTokenPromise ??= client
		.post(authRefresh)
		.then(() => undefined)
		.catch((error) => {
			// clear auth state, layout redirects to login
			authStoreActions.logout();
			throw error;
		})
		.finally(() => {
			refreshTokenPromise = null;
		});
	return refreshTokenPromise;
};

client.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const config = error.config as RetriableRequestConfig | undefined;

		// if request return 401, try to refresh token and retry the request, only once globally.
		if (
			error.response?.status !== 401 ||
			!config ||
			config._retry ||
			config.url === authRefresh
		) {
			throw error;
		}

		config._retry = true;
		await refreshToken();
		return client(config);
	}
);
