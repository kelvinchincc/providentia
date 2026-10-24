/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { z } from 'zod';
import { createBaseApiResponseSchema } from './base';

export const overviewSchema = z.object({
	total: z.number().int().nonnegative(),
	paid: z.number().int().nonnegative(),
	free: z.number().int().nonnegative(),
	pullCount: z.number().int().nonnegative(),
	linearAvg: z.number().int().nonnegative(),
	monthlyAvg: z.number().int().nonnegative()
});

export const overviewAPIResposneSchema = createBaseApiResponseSchema(overviewSchema);

export type Overview = z.infer<typeof overviewSchema>;
export type OverviewAPIResponse = z.infer<typeof overviewAPIResposneSchema>;
