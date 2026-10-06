/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createStore, useSelector } from '@tanstack/svelte-store';
import dayjs from 'dayjs';
import { createStoreWriter, getStoreItems } from '../utils/store';

const storeKey = 'authStore';

type AuthStore = {
	username: string | null;
	tokenExpiresAt: number | null;
	refreshTokenExpiresAt: number | null;
};

export const authStore = createStore(
	getStoreItems<AuthStore>(storeKey) ??
		({
			username: null,
			tokenExpiresAt: null,
			refreshTokenExpiresAt: null
		} as AuthStore)
);
export const useAuthStore = () => useSelector(authStore, (state) => state);

const update = createStoreWriter(storeKey, authStore);

export const authStoreActions = {
	login: (username: string, tokenExpiry: number, refreshTokenExpiry: number) => {
		update((prev) => {
			const now = dayjs().unix();

			return {
				...prev,
				username,
				tokenExpiresAt: now + tokenExpiry,
				refreshTokenExpiresAt: now + refreshTokenExpiry
			};
		});
	},
	logout: () => {
		update((prev) => ({
			...prev,
			username: null,
			tokenExpiresAt: null,
			refreshTokenExpiresAt: null
		}));
	}
};
