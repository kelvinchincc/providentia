/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createQuery } from '@tanstack/svelte-query';
import { queryKeys } from './queryKeys';
import { client } from '../apiClient';
import { gemHistory } from '../apiRoutes';
import {
	gemHistoryApiResponseSchema,
	type GemHistoryApiResponse
} from '#lib/schema/api/gem-history.js';

export const createGemsHistoryQuery = (params: { from: string; limit: number }) => {
	const queryFn = async () => {
		const response = await client.get<GemHistoryApiResponse>(gemHistory, {
			params: {
				from: params.from === '' ? undefined : params.from,
				limit: params.limit
			}
		});
		if (!gemHistoryApiResponseSchema.safeParse(response.data)) {
			throw new Error('Invalid response data from gem history API');
		}

		return response.data.success ? response.data.data : [];
	};

	return createQuery(() => ({
		queryKey: queryKeys.gemHistoryWithParams(params),
		queryFn
	}));
};
