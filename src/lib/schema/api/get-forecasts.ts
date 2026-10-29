/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { z } from 'zod';
import { createBaseApiResponseSchema } from './base';

export const targetStatusEnumSchema = z.enum(['no', 'hit', 'safe']);
const expectedStatSchema = z.object({
	amount: z.number().int(),
	pull: z.number().int(),
	targetHit: targetStatusEnumSchema
});

export const forecastItemSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	targetDate: z.number().int(),
	targetAmount: z.number().int(),
	targetPull: z.number().int(),
	expected: z.object({
		linear: expectedStatSchema,
		monthlyAvg: expectedStatSchema
	}),
	createdAt: z.number().int(),
	updatedAt: z.number().int()
});
export const forecastItemsSchema = z.array(forecastItemSchema);
export const forecastItemsApiResponseSchema = createBaseApiResponseSchema(forecastItemsSchema);

export type ForecastTargetHit = z.infer<typeof targetStatusEnumSchema>;
export type ForecastItem = z.infer<typeof forecastItemSchema>;
export type ForecastItems = z.infer<typeof forecastItemsSchema>;
export type ForecastItemsApiResponse = z.infer<typeof forecastItemsApiResponseSchema>;
