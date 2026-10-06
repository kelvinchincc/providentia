/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { browser } from '$app/env';
import { createStore } from '@tanstack/svelte-store';
import dayjs from 'dayjs';

const storeKey = 'authStore';

type AuthStore = {
	username: string | null;
	tokenExpiresAt: number | null;
	refreshTokenExpiresAt: number | null;
};

export const authStore = createStore(
	loadFromStorage() ??
		({
			username: null,
			tokenExpiresAt: null,
			refreshTokenExpiresAt: null
		} as AuthStore)
);

export const authStoreActions = {
	login: (username: string, tokenExpiry: number, refreshTokenExpiry: number) => {
		writeToStorage((prev) => {
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
		writeToStorage((prev) => ({
			...prev,
			username: null,
			tokenExpiresAt: null,
			refreshTokenExpiresAt: null
		}));
	}
};

function loadFromStorage(): AuthStore | null {
	if (!browser) return null;

	const data = localStorage.getItem(storeKey);
	return data ? (JSON.parse(data) as AuthStore) : null;
}

function writeToStorage(updator: (prev: AuthStore) => AuthStore) {
	authStore.setState((prev) => {
		const result = updator(prev);
		localStorage.setItem(storeKey, JSON.stringify(result));
		return result;
	});
}
