/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createQuery } from '@tanstack/svelte-query';
import { queryKeys } from './queryKeys';
import { client } from '../apiClient';
import { listForecasts } from '../apiRoutes';
import { forecastItemsApiResponseSchema } from '#lib/schema/api/get-forecasts.js';

export function createListForecastsQuery() {
	const queryFn = async () => {
		const result = await client.get(listForecasts);
		const data = forecastItemsApiResponseSchema.safeParse(result.data);
		if (!data.success) {
			throw new Error('Failed to parse forecast items response', { cause: data.error });
		}
		if (!data.data.success)
			throw new Error('Failed to fetch forecast items', { cause: data.data.message });

		return data.data.data;
	};

	return createQuery(() => ({
		queryKey: queryKeys.forecasts(),
		queryFn
	}));
}
