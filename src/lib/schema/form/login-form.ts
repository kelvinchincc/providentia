/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { z } from 'zod';

export const loginFormSchema = z.object({
	username: z.string().min(1, 'Username is required'),
	password: z.string().min(1, 'Password is required')
});

export type LoginFormSchema = z.infer<typeof loginFormSchema>;

export function initialValues(): LoginFormSchema {
	return {
		username: '',
		password: ''
	};
}
