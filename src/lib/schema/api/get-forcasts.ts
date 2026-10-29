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

export const forcastItemSchema = z.object({
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
export const forcastItemsSchema = z.array(forcastItemSchema);
export const forcastItemsApiResponseSchema = createBaseApiResponseSchema(forcastItemsSchema);

export type ForcastTargetHit = z.infer<typeof targetStatusEnumSchema>;
export type ForcastItem = z.infer<typeof forcastItemSchema>;
export type ForcastItems = z.infer<typeof forcastItemsSchema>;
export type ForcastItemsApiResponse = z.infer<typeof forcastItemsApiResponseSchema>;
