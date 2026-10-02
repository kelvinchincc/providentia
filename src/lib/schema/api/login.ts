/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { z } from 'zod';

export const loginRequestSchema = z.object({
	username: z.string('Username is required'),
	password: z.string('Password is required')
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
