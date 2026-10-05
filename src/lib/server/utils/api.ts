/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { HTTPExceptionBase } from '#lib/exception/http/http-exception-base.js';
import type { RequestHandler } from '@sveltejs/kit';

/**
 * Wraps a request handler with error handling for HTTP exceptions.
 *
 * If the handler throws an instance of HTTPExceptionBase, it constructs a response using the exception's
 * constructResponse method.
 * If the handler throws any other error, it returns a generic 500 Internal Server Error response.
 * @param handler - The request handler to be wrapped.
 * @returns A new request handler with error handling for HTTP exceptions.
 */
export function createApiRoute(handler: RequestHandler): RequestHandler {
	return async (event) => {
		try {
			return await handler(event);
		} catch (error) {
			if (!(error instanceof HTTPExceptionBase))
				return Response.json({ error: 'Internal server error' }, { status: 500 });

			return error.constructResponse();
		}
	};
}

/**
 * Constructs a successful JSON response with the provided data and status code.
 * @param data - The data to be included in the response body.
 * @param status - The HTTP status code for the response (default is 200). Must be in the 2xx range.
 * @returns A Response object representing the successful JSON response.
 */
export function okResponse(data: unknown, status: number = 200) {
	if (status < 200 || status >= 300) {
		throw new Error('Status code must be in the 2xx range for a successful response');
	}

	return Response.json(data, { status: status });
}
