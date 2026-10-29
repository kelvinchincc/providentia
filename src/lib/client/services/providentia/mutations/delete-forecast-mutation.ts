/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createMutation } from '@tanstack/svelte-query';
import { client } from '../apiClient';
import { deleteForecast } from '../apiRoutes';

export function createDeleteForecastMutation() {
	const mutationFn = async (forecastId: string) => {
		return await client.delete(deleteForecast, { params: { id: forecastId } });
	};
	return createMutation(() => ({ mutationFn }));
}
