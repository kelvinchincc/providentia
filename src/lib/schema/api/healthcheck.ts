/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { z } from 'zod';
import { createBaseApiResponseSchema } from './base';

export const healthcheckApiDataSchema = z.object({
	status: z.string(),
	initialized: z.boolean()
});
export const healthcheckApiResponseSchema = createBaseApiResponseSchema(healthcheckApiDataSchema);

export type HealthCheckApiData = z.infer<typeof healthcheckApiDataSchema>;
export type HealthcheckApiResponse = z.infer<typeof healthcheckApiResponseSchema>;
