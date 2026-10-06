/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createMutation } from '@tanstack/svelte-query';
import { authLogout } from '../apiRoutes';
import axios from 'axios';
import { authStoreActions } from '#lib/client/store/authStore.js';

export function createLogoutMutation() {
	return createMutation(() => ({
		mutationFn: async () => {
			const response = await axios.post(authLogout);
			authStoreActions.logout();
			return response.data;
		}
	}));
}
