/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { z } from 'zod';

export const updateNotePresetPayloadSchema = z.object({
	id: z.uuid().min(1, 'ID is required'),
	content: z
		.string()
		.min(1, 'Content is required')
		.max(30, 'Content must be at most 30 characters long')
});

export type UpdateNotePresetPayload = z.infer<typeof updateNotePresetPayloadSchema>;
