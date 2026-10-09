/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createStore, useSelector } from '@tanstack/svelte-store';

interface Store {
	message: string;
	title?: string;
	open: boolean;
	onClose?: () => void;
	onOk: () => void;
	onCancel?: () => void;
}

const store = createStore<Store>({
	message: '',
	title: undefined,
	open: false,
	onOk: () => {}
});

export function useDialogStore() {
	return useSelector(store, (store) => store);
}

export const dialogStoreActions = {
	alert: (message: string, options: Partial<Omit<Store, 'message' | 'open'>> = {}) => {
		const { onOk, ...remain } = options;
		store.setState((state) => ({
			...state,
			message,
			open: true,
			onOk: onOk || (() => {}),
			...remain
		}));
	},
	handleClose: () => {
		store.setState((state) => {
			state.onClose?.();
			return {
				...state,
				open: false
			};
		});
	}
};
