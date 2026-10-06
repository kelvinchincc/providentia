/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
	loginApiResponseSchema,
	type LoginApiResponse,
	type LoginRequest
} from '#lib/schema/api/login.js';
import { createMutation } from '@tanstack/svelte-query';
import axios from 'axios';
import { authLogin } from '../apiRoutes';
import { InvalidApiResponse } from '#lib/exception/invalid-api-response.js';

export const createLoginMutation = () => {
	return createMutation(() => ({
		mutationFn: async (body: LoginRequest) => {
			const response = await axios.post<LoginApiResponse>(authLogin, body);
			try {
				loginApiResponseSchema.parse(response.data);
			} catch (error) {
				throw new InvalidApiResponse({
					apiRoute: authLogin,
					error: error instanceof Error ? error : undefined
				});
			}
			return response.data;
		}
	}));
};
