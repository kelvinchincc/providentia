/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { BadRequestException } from '#lib/exception/http/bad-request-exception.js';
import { NotImplementedException } from '#lib/exception/http/not-implemented-exception.js';
import { logGemSchema, type LogGemRequest } from '#lib/schema/api/log-gems.js';
import { db } from '#lib/server/db/index.js';
import { gem } from '#lib/server/db/schemas/gem.schema.js';
import { createApiRoute } from '#lib/server/utils/api.js';
import { verifyAuth } from '#lib/server/utils/auth.js';

export const POST = createApiRoute(async ({ cookies, request }) => {
	await verifyAuth(cookies);

	const body: LogGemRequest = await request.json();
	const amount = Number(body.amount);

	try {
		logGemSchema.parse(body);
		if (amount <= 0 || !Number.isInteger(amount)) {
			throw new BadRequestException('Amount must be a positive integer');
		}
	} catch (error) {
		throw new BadRequestException('Invalid request body');
	}

	await db.transaction(async (tx) => {
		tx.insert(gem).values({
			type: body.type,
			amount,
			note: body.note
		});
	});

	throw new NotImplementedException();
});
