/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { UnauthorizedException } from '#lib/exception/http/unauthorized-exception.js';
import { createApiRoute, noContentResponse } from '#lib/server/utils/api.js';
import { invalidateTokens, verifyAuth } from '#lib/server/utils/auth.js';

export const POST = createApiRoute(async ({ cookies }) => {
	const user = await verifyAuth(cookies);
	if (!user) throw new UnauthorizedException('User not authenticated');

	await invalidateTokens(user);

	cookies.delete('auth');
	cookies.delete('refresh');

	return noContentResponse();
});
