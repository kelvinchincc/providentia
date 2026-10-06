/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { z } from 'zod';
import { createBaseApiResponseSchema } from './base';

export const loginRequestSchema = z.object({
	username: z.string('Username is required'),
	password: z.string('Password is required')
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const loginApiDataSchema = z.object({
	username: z.string(),
	authToken: z.literal('cookie'),
	authTokenTTL: z.number(),
	refreshToken: z.literal('cookie'),
	refreshTokenTTL: z.number()
});

export type LoginApiData = z.infer<typeof loginApiDataSchema>;

export const loginApiResponseSchema = createBaseApiResponseSchema(loginApiDataSchema);
export type LoginApiResponse = z.infer<typeof loginApiResponseSchema>;
