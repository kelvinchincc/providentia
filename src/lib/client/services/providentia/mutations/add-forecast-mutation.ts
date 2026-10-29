/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
	createForecastApiResponseSchema,
	createForecastPayloadSchema,
	type CreateForecastApiResponse,
	type CreateForecastPayload
} from '#lib/schema/api/create-forecast.js';
import { createMutation } from '@tanstack/svelte-query';
import { client } from '../apiClient';
import { createForecast } from '../apiRoutes';

export function createAddForecastMutation() {
	const mutationFn = async (payload: CreateForecastPayload) => {
		try {
			createForecastPayloadSchema.parse(payload);
		} catch (error) {
			throw new Error('Invalid payload schema', { cause: error });
		}

		const response = await client.post<CreateForecastApiResponse>(createForecast, payload);
		const data = createForecastApiResponseSchema.safeParse(response.data);

		if (!data.success) throw new Error('Invalid response schema', { cause: data.error });
		if (!data.data.success)
			throw new Error('API returned an error', { cause: data.data.message });

		return data.data.data;
	};

	return createMutation(() => ({ mutationFn }));
}
