/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import dayjs, { type Dayjs } from 'dayjs';
import { z } from 'zod';

export const updateForecastPayloadSchema = z.object({
	id: z.uuid().min(1, 'Id is required'),
	name: z.string().optional(),
	targetDate: z.number().optional()
});

export const updateForecastFormSchema = z.object({
	name: z.string().max(30, 'Name shall not more than 30 characters.').optional(),
	targetDate: z
		.custom<Dayjs>()
		.optional()
		.refine(
			(value) => {
				const today = dayjs().startOf('day');
				if (!value) return true;
				console.log({ today, value });

				return today.isBefore(value);
			},
			{ error: 'Target date shall be in the future.' }
		)
});

export type UpdateForecastPayload = z.infer<typeof updateForecastPayloadSchema>;
export type UpdateForecastForm = z.infer<typeof updateForecastFormSchema>;

export function createDefaultValues(): UpdateForecastForm {
	return {
		name: undefined,
		targetDate: undefined
	};
}
