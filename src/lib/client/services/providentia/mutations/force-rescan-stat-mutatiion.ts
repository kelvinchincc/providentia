/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createMutation } from '@tanstack/svelte-query';
import { client } from '../apiClient';
import { forceRescanStats } from '../apiRoutes';

export function createForceRescanStatMutation() {
	const mutationFn = async () => {
		return await client.post(forceRescanStats);
	};

	return createMutation(() => ({ mutationFn }));
}
