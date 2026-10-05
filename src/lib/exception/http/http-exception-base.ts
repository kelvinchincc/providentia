/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { createErrApiResponse } from '#lib/schema/api/base.js';

export class HTTPExceptionBase extends Error {
	constructor(
		message: string,
		public statusCode: number
	) {
		super(message);
		this.name = this.constructor.name;
	}

	getStatusCode(): number {
		return this.statusCode;
	}

	getMessage(): string {
		return this.message;
	}

	constructResponse(): Response {
		return Response.json(createErrApiResponse(this.getMessage()), {
			status: this.getStatusCode()
		});
	}
}
