/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createMutation } from '@tanstack/svelte-query';
import { client } from '../apiClient';
import { deleteGems } from '../apiRoutes';

export function createDeleteGemsMutation() {
	const mutationFn = async (id: string) => {
		await client.delete(deleteGems, {
			params: { id }
		});
	};

	return createMutation(() => ({
		mutationFn
	}));
}
