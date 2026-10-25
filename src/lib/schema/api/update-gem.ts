/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { GemType } from '#lib/constants/gem-type.js';
import { z } from 'zod';

export const updateGemSchema = z.object({
	id: z.uuid('Invalid UUID format'),
	amount: z.number().optional(),
	type: z.enum([GemType.FREE, GemType.PAID]).optional(),
	note: z.string().optional()
});

export type UpdateGemSchema = z.infer<typeof updateGemSchema>;
