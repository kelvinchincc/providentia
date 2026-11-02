/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { z } from 'zod';

export const updateProfileSchema = z.object({
	username: z.string().min(3).max(20).optional(),
	password: z.string().min(8).max(100).optional(),
	confirmPassword: z.string().min(8).max(100).optional()
});

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
