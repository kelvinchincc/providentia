/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
	updateGemFormSchema,
	type UpdateGemFormSchema,
	type UpdateGemSchema
} from '#lib/schema/api/update-gem.js';
import { createMutation } from '@tanstack/svelte-query';
import { client } from '../apiClient';
import { updateGems } from '../apiRoutes';

export function createUpdateGemsMutation() {
	const mutationFn = async ({ id, ...data }: UpdateGemFormSchema & { id: string }) => {
		try {
			updateGemFormSchema.parse(data);
		} catch (error) {
			console.error('Validation error:', error);
			throw new Error('Invalid data format');
		}

		await client.put(updateGems, {
			id,
			amount: Number.parseInt(data.amount),
			note: data.note,
			type: data.type
		} as UpdateGemSchema);
	};

	return createMutation(() => ({ mutationFn }));
}
