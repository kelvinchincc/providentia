/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createMutation } from '@tanstack/svelte-query';
import { client } from '../apiClient';
import { deleteNotePreset } from '../apiRoutes';

export function createDeleteNotePresetMutation() {
	const mutationFn = async (notePresetId: string) => {
		return await client.delete(deleteNotePreset, { params: { id: notePresetId } });
	};

	return createMutation(() => ({ mutationFn }));
}
