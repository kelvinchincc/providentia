/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createInfiniteQuery, createQuery } from '@tanstack/svelte-query';
import { queryKeys } from './queryKeys';
import { client } from '../apiClient';
import { gemHistory } from '../apiRoutes';
import {
	gemHistoryApiResponseSchema,
	type GemHistoryApiResponse
} from '#lib/schema/api/gem-history.js';

export const createGemsHistoryQuery = ({ limit }: { limit: number }) => {
	const queryFn = async ({ pageParam }: { pageParam: string }) => {
		console.log({ pageParam });
		const response = await client.get<GemHistoryApiResponse>(gemHistory, {
			params: {
				from: pageParam === '' ? undefined : pageParam,
				limit: limit || 10
			}
		});
		if (!gemHistoryApiResponseSchema.safeParse(response.data)) {
			throw new Error('Invalid response data from gem history API');
		}

		return response.data.success ? response.data.data : null;
	};

	return createInfiniteQuery(() => ({
		queryKey: queryKeys.gemHistory(),
		queryFn: async ({ pageParam }) => await queryFn({ pageParam }),
		initialPageParam: '',
		getNextPageParam: (lastPage) => (lastPage?.haveMore ? lastPage.next : undefined)
	}));
};
