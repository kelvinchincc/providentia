/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { z } from 'zod';
import { createBaseApiResponseSchema } from './base';

export const createForcastPayloadSchema = z.object({
	name: z.string().min(1, 'Name is required.'),
	targetDate: z
		.number()
		.min(1, 'Target date must be a positive integer representing a timestamp in unix time.')
});
export const createForcastResponseSchema = z.object({
	id: z.uuid()
});
export const createForcastApiResponseSchema = createBaseApiResponseSchema(
	createForcastResponseSchema
);

export type CreateForcastPayload = z.infer<typeof createForcastPayloadSchema>;
export type CreateForcastResponse = z.infer<typeof createForcastResponseSchema>;
export type CreateForcastApiResponse = z.infer<typeof createForcastApiResponseSchema>;
