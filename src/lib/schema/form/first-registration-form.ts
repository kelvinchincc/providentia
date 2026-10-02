/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { z } from 'zod';

export const firstRegistrationFormSchema = z
	.object({
		username: z
			.string()
			.min(3, { message: 'Username must be at least 3 characters long' })
			.max(20, { message: 'Username must be at most 20 characters long' }),
		password: z
			.string()
			.min(8, { message: 'Password must be at least 8 characters long' })
			.max(100, { message: 'Password must be at most 100 characters long' }),
		confirmPassword: z
			.string()
			.min(8, { message: 'Confirm Password must be at least 8 characters long' })
			.max(100, { message: 'Confirm Password must be at most 100 characters long' })
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword']
	});

export type FirstRegistrationFormData = z.infer<typeof firstRegistrationFormSchema>;
export function initialValues(): FirstRegistrationFormData {
	return {
		username: '',
		password: '',
		confirmPassword: ''
	};
}
