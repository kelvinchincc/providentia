/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createQuery } from '@tanstack/svelte-query';
import { queryKeys } from './queryKeys';
import { client } from '../apiClient';
import { listForcasts } from '../apiRoutes';
import { forcastItemsApiResponseSchema } from '#lib/schema/api/get-forcasts.js';

export function createListForcastsQuery() {
	const queryFn = async () => {
		const result = await client.get(listForcasts);
		const data = forcastItemsApiResponseSchema.safeParse(result.data);
		if (!data.success) {
			throw new Error('Failed to parse forcast items response', { cause: data.error });
		}
		if (!data.data.success)
			throw new Error('Failed to fetch forcast items', { cause: data.data.message });

		return data.data.data;
	};

	return createQuery(() => ({
		queryKey: queryKeys.forcasts(),
		queryFn
	}));
}
