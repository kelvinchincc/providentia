/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createQuery } from '@tanstack/svelte-query';
import { client } from '../apiClient';
import { gemsOverview } from '../apiRoutes';
import { overviewAPIResposneSchema, type OverviewAPIResponse } from '#lib/schema/api/overview.js';
import { queryKeys } from './queryKeys';

export const createGemsOverviewQuery = () => {
	async function queryFn() {
		const res = await client.get<OverviewAPIResponse>(gemsOverview);
		try {
			overviewAPIResposneSchema.parse(res.data);
		} catch (error) {
			console.error(error);
			throw new Error('Invalid response from API');
		}

		return res.data.success ? res.data.data : undefined;
	}

	return createQuery(() => ({
		queryKey: queryKeys.gemsOverview(),
		queryFn,
		refetchInterval: 1000 * 60 // 1 minute
	}));
};
