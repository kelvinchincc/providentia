/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
	updateNotePresetPayloadSchema,
	type UpdateNotePresetPayload
} from '#lib/schema/api/update-note-preset.js';
import { createMutation } from '@tanstack/svelte-query';
import { client } from '../apiClient';
import { updateNotePreset } from '../apiRoutes';

export function createUpdateNotePresetMutation() {
	const mutationFn = async (payload: UpdateNotePresetPayload) => {
		try {
			updateNotePresetPayloadSchema.parse(payload);
		} catch (error) {
			throw new Error('Invalid payload for updateNotePreset mutation', { cause: error });
		}

		return await client.put(updateNotePreset, payload);
	};

	return createMutation(() => ({ mutationFn }));
}
