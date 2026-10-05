/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { HTTPExceptionBase } from './http-exception-base';

export class InternalServerErrorException extends HTTPExceptionBase {
	constructor(message: string = 'Internal Server Error') {
		super(message, 500);
		this.name = 'InternalServerErrorException';
	}
}
