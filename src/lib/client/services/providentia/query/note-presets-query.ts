/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createQuery } from '@tanstack/svelte-query';
import { queryKeys } from './queryKeys';
import { client } from '../apiClient';
import { listNotePreset } from '../apiRoutes';
import {
	getNotePresetsResponseSchema,
	type GetNotePresetsResponse,
	type NotePresets
} from '#lib/schema/api/get-note-presets.js';

export function createNotePresetsQuery() {
	const queryFn = async (): Promise<NotePresets> => {
		const response = await client.get<GetNotePresetsResponse>(listNotePreset);
		const parsed = getNotePresetsResponseSchema.safeParse(response.data);
		if (!parsed.success) throw new Error('Invalid response data', { cause: parsed.error });
		if (!parsed.data.success)
			throw new Error('API request failed', { cause: parsed.data.message });

		return parsed.data.data;
	};

	return createQuery(() => ({
		queryKey: queryKeys.notePresets(),
		queryFn
	}));
}
