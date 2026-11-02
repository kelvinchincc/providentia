/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { updateProfileSchema, type UpdateProfileSchema } from '#lib/schema/api/update-profile.js';
import { createMutation } from '@tanstack/svelte-query';
import { client } from '../apiClient';
import { updateProfile } from '../apiRoutes';

export function createUpdateProfileMutation() {
	const mutationFn = async (payload: UpdateProfileSchema) => {
		updateProfileSchema.parse(payload);
		return await client.post(updateProfile, payload);
	};

	return createMutation(() => ({ mutationFn }));
}
