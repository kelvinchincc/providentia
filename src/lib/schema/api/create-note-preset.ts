/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { z } from 'zod';

export const createNotePresetRequest = z.object({
	// Optional for now, reserved for future use
	name: z.string().optional(),
	content: z.string().min(1).max(30)
});

export type CreateNotePresetRequest = z.infer<typeof createNotePresetRequest>;
