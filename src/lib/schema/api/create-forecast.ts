/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { z } from 'zod';
import { createBaseApiResponseSchema } from './base';
import dayjs, { type Dayjs } from 'dayjs';

export const createForecastPayloadSchema = z.object({
	name: z.string().min(1, 'Name is required.'),
	targetDate: z
		.number()
		.min(1, 'Target date must be a positive integer representing a timestamp in unix time.')
});
export const createForecastResponseSchema = z.object({
	id: z.uuid()
});
export const createForecastApiResponseSchema = createBaseApiResponseSchema(
	createForecastResponseSchema
);
export const createForecastFormSchema = z.object({
	name: z.string().min(1, 'Name is required').max(30, 'Name shall not longer than 30 characters'),
	targetDate: z
		.custom<Dayjs>()
		.optional()
		.refine((value) => value != null, { error: 'Target date is required' })
		.refine(
			(value) => {
				const today = dayjs().startOf('day');
				return today.isBefore(value);
			},
			{ error: 'Target date must be a future date' }
		)
});

export type CreateForecastPayload = z.infer<typeof createForecastPayloadSchema>;
export type CreateForecastResponse = z.infer<typeof createForecastResponseSchema>;
export type CreateForecastApiResponse = z.infer<typeof createForecastApiResponseSchema>;
export type CreateForecastFormData = z.infer<typeof createForecastFormSchema>;

export function createDefaultValues(): CreateForecastFormData {
	return {
		name: '',
		targetDate: undefined
	};
}
