/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
	updateForecastPayloadSchema,
	type UpdateForecastPayload
} from '#lib/schema/api/update-forecast.js';
import { createMutation } from '@tanstack/svelte-query';
import { client } from '../apiClient';
import { updateForecast } from '../apiRoutes';

export function createEditForecastMutation() {
	const mutationFn = async (payload: UpdateForecastPayload) => {
		const schemaResult = updateForecastPayloadSchema.safeParse(payload);
		if (!schemaResult.success)
			throw new Error('Invalid payload format', { cause: schemaResult.error });
		return await client.put(updateForecast, schemaResult.data);
	};

	return createMutation(() => ({ mutationFn }));
}
