/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { z } from 'zod';
import { createBaseApiResponseSchema } from './base';

export const forcastItemSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	targetDate: z.number().int(),
	linearAverage: z.number().int(),
	monthlyAverage: z.number().int(),
	createdAt: z.number().int(),
	updatedAt: z.number().int()
});
export const forcastItemsSchema = z.array(forcastItemSchema);
export const forcastItemsApiResponseSchema = createBaseApiResponseSchema(forcastItemsSchema);

export type ForcastItem = z.infer<typeof forcastItemSchema>;
export type ForcastItems = z.infer<typeof forcastItemsSchema>;
export type ForcastItemsApiResponse = z.infer<typeof forcastItemsApiResponseSchema>;
