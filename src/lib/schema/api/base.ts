/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { z, type ZodType } from 'zod';

export function createBaseApiResponseSchema<T extends z.ZodType>(dataSchema: T) {
	return z.discriminatedUnion('success', [
		z.object({
			success: z.literal(true),
			data: dataSchema
		}),
		z.object({
			success: z.literal(false),
			message: z.string()
		})
	]);
}

/**
 * Creates a successful API response with the given schema and data.
 * @param schema The Zod schema to validate the data against.
 * @param data The data to be validated and returned in the response.
 * @returns An object representing a successful API response, containing the validated data.
 * @throws {ZodError} If the data does not conform to the provided schema.
 */
export function createOkApiResponse<T extends ZodType>(schema: T, data: z.infer<T>) {
	return {
		success: true,
		data: schema.parse(data)
	};
}

export function createErrApiResponse(message: string) {
	return {
		success: false,
		message
	};
}
