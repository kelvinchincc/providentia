/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { z } from 'zod';
import { createBaseApiResponseSchema } from './base';

export const notePresetSchema = z.object({
	id: z.uuid(),
	tag: z.string().min(1).max(100),
	createdAt: z.number(),
	updatedAt: z.number()
});
export const notePresetsSchema = z.array(notePresetSchema);
export const getNotePresetsResponseSchema = createBaseApiResponseSchema(notePresetsSchema);

export type NotePreset = z.infer<typeof notePresetSchema>;
export type NotePresets = z.infer<typeof notePresetsSchema>;
export type GetNotePresetsResponse = z.infer<typeof getNotePresetsResponseSchema>;
