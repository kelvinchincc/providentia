/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { RegisterUserRequest } from '#lib/schema/api/register-user.js';
import { createMutation } from '@tanstack/svelte-query';
import axios from 'axios';
import { authRegister } from '../apiRoutes';

export function createRegisterMutation() {
	return createMutation(() => ({
		mutationFn: async (data: RegisterUserRequest) => {
			return await axios.post(authRegister, data);
		}
	}));
}
