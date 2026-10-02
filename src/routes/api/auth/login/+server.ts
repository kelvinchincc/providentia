import { json } from '@sveltejs/kit';
import type { RequestHandler } from '../../healthcheck/$types';
import { createBasicOkApiResponse } from '$lib/schema/api/base';

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
export const POST: RequestHandler = async () => {
	return json(createBasicOkApiResponse('Not Implemented'), { status: 501 });
};
