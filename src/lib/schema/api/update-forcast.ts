/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { z } from 'zod';

export const updateForcastPayloadSchema = z.object({
	id: z.uuid().min(1, 'Id is required'),
	name: z.string().optional(),
	targetDate: z.number().optional()
});

export type UpdateForcastPayload = z.infer<typeof updateForcastPayloadSchema>;
