/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
	logGemApiSchema,
	type LogGemApiRequest,
	type LogGemRequest
} from '#lib/schema/api/log-gems.js';
import { createMutation } from '@tanstack/svelte-query';
import { client } from '../apiClient';

export const createLogGemsMutation = () => {
	return createMutation(() => ({
		mutationFn: async ({ amount, ...body }: LogGemRequest) => {
			const payload: LogGemApiRequest = {
				...body,
				amount: Number(amount)
			};
			logGemApiSchema.parse(payload);
			const response = await client.post('/api/stats/log-gems', payload);
			return response.data;
		}
	}));
};
