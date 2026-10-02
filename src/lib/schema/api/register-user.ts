/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { z } from 'zod';

export const registerUserRequestSchema = z.object({
	username: z.string().min(3).max(30),
	password: z.string().min(8).max(100),
	confirmPassword: z.string().min(8).max(100)
});

export type RegisterUserRequest = z.infer<typeof registerUserRequestSchema>;
