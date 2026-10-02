/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { z, ZodType } from 'zod';

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

export const basicOkApiResponseSchema = createBaseApiResponseSchema(z.string());
export type BasicOkApiResponse = z.infer<typeof basicOkApiResponseSchema>;

/**
 * Creates a successful API response with a basic string message.
 * @param message The message to be returned in the response.
 * @returns An object representing a successful API response, containing the provided message.
 */
export function createBasicOkApiResponse(message: string): BasicOkApiResponse {
	return {
		success: true,
		data: message
	};
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

/**
 * Creates an error API response with the given message.
 * @param message The error message to be returned in the response.
 * @returns An object representing an error API response, containing the provided message.
 */
export function createErrApiResponse(message: string) {
	return {
		success: false,
		message
	};
}
