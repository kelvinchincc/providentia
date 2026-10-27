/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createNotePresetRequest } from '#lib/schema/api/create-note-preset.js';
import { createMutation } from '@tanstack/svelte-query';
import { client } from '../apiClient';
import { addNotePreset } from '../apiRoutes';

export function createAddNotePresetMutation() {
	const mutationFn = async (payload: { content: string }) => {
		const body = createNotePresetRequest.safeParse(payload);
		if (!body.success) {
			throw new Error('Invalid request body', { cause: body.error });
		}

		return await client.post(addNotePreset, body.data);
	};

	return createMutation(() => ({ mutationFn }));
}
