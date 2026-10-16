/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { z } from 'zod';
import { createBaseApiResponseSchema } from './base';

export const gemHistorySchema = z.object({
	id: z.uuid(),
	userId: z.uuid(),
	amount: z.number().int().nonnegative(),
	obtainedAt: z.number().int().nonnegative(),
	updatedAt: z.number().int().nonnegative(),
	note: z.string().optional(),
	type: z.string()
});
export const gemHistoryArraySchema = z.array(gemHistorySchema);
export const pagedGemHistoryArraySchema = z.object({
	list: gemHistoryArraySchema,
	haveMore: z.boolean(),
	next: z.uuid()
});
export const gemHistoryApiResponseSchema = createBaseApiResponseSchema(pagedGemHistoryArraySchema);

export type GemHistory = z.infer<typeof gemHistorySchema>;
export type GemHistories = z.infer<typeof gemHistoryArraySchema>;
export type PagedGemHistories = z.infer<typeof pagedGemHistoryArraySchema>;
export type GemHistoryApiResponse = z.infer<typeof gemHistoryApiResponseSchema>;
