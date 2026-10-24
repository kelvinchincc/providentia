/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { z } from 'zod';

export const logGemSchema = z.object({
	amount: z
		.string('Amount is required')
		.min(1, 'Amount is required')
		.refine(
			(val) => {
				// value must be valid numeric
				return !isNaN(Number(val));
			},
			{
				message: 'Amount must be a valid number'
			}
		),
	type: z.enum(['free', 'paid'], 'Type is required'),
	note: z.string().optional()
});

export type LogGemRequest = z.infer<typeof logGemSchema>;

export const logGemApiSchema = z.object({
	amount: z.number('Amount is required'),
	type: z.enum(['free', 'paid'], 'Type is required'),
	note: z.string().optional()
});

export type LogGemApiRequest = z.infer<typeof logGemApiSchema>;

export function createDefaultValues(): LogGemRequest {
	return {
		amount: '',
		type: 'free',
		note: ''
	};
}
