/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { Store } from '@tanstack/svelte-store';

type StoreFn = () => Storage | null;
const defaultStoreFn = () => (typeof window !== 'undefined' ? window.localStorage : null);

export function getStoreItems<T>(storeKey: string, storeFn: StoreFn = defaultStoreFn): T | null {
	const store = storeFn();
	if (!store) return null;

	const data = store.getItem(storeKey);

	return data ? (JSON.parse(data) as T) : null;
}

export function writeStoreItems<T>(
	storeKey: string,
	store: Store<T>,
	updator: (prev: T) => T,
	storeFn: StoreFn = defaultStoreFn
): void {
	const storage = storeFn();
	if (!storage) return;

	store.setState((prev) => {
		const newState = updator(prev);
		storage.setItem(storeKey, JSON.stringify(newState));
		return newState;
	});
}

export function createStoreWriter<T>(
	storeKey: string,
	store: Store<T>,
	storeFn: StoreFn = defaultStoreFn
) {
	return (updator: (prev: T) => T) => {
		writeStoreItems<T>(storeKey, store, updator, storeFn);
	};
}
