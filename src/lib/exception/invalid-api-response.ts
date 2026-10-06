/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

type InvalidApiResponseParams = {
	message?: string;
	apiRoute?: string;
	error?: Error;
};

export class InvalidApiResponse extends Error {
	error?: Error;
	apiRoute?: string;

	constructor({ message, apiRoute, error }: InvalidApiResponseParams = {}) {
		super(message || 'Invalid API response');
		this.name = 'InvalidApiResponse';
		this.error = error;
		this.apiRoute = apiRoute;
	}

	toString() {
		// Customize the string representation of the error, so it include api route and original error if available
		let errorString = `${this.name}: ${this.message}`;
		if (this.apiRoute) {
			errorString += ` | API Route: ${this.apiRoute}`;
		}
		if (this.error) {
			errorString += ` | Original Error: ${this.error.toString()}`;
		}
		return errorString;
	}
}
