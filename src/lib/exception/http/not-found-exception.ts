/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { HTTPExceptionBase } from './http-exception-base';

export class NotFoundException extends HTTPExceptionBase {
	constructor(message: string = 'Resource not found') {
		super(message, 404);
	}
}
