/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { BadRequestException } from '#lib/exception/http/bad-request-exception.js';
import { NotFoundException } from '#lib/exception/http/not-found-exception.js';
import { UnauthorizedException } from '#lib/exception/http/unauthorized-exception.js';
import { createOkApiResponse } from '#lib/schema/api/base.js';
import {
	createForcastPayloadSchema,
	createForcastResponseSchema
} from '#lib/schema/api/create-forcast.js';
import { updateForcastPayloadSchema } from '#lib/schema/api/update-forcast.js';
import { db } from '#lib/server/db/index.js';
import { forcast } from '#lib/server/db/schemas/forcast.schema.js';
import { createApiRoute, noContentResponse, okResponse } from '#lib/server/utils/api.js';
import { verifyAuth } from '#lib/server/utils/auth.js';
import { generateCurrentTimestamp } from '#lib/server/utils/datetime.js';
import { logger } from '#lib/server/utils/logger.js';
import dayjs from 'dayjs';
import { and, eq } from 'drizzle-orm';

export const POST = createApiRoute(async ({ cookies, request }) => {
	const user = await verifyAuth(cookies);
	const body = createForcastPayloadSchema.safeParse(await request.json());

	if (!user) throw new UnauthorizedException();
	if (!body.success) throw new BadRequestException('Invalid request body');
	const today = dayjs();
	const target = dayjs.unix(body.data.targetDate);

	if (target.isBefore(today)) throw new BadRequestException('Target date must be in the future');

	const result = await db
		.insert(forcast)
		.values({
			name: body.data.name,
			targetDate: body.data.targetDate,
			userId: user.id
		})
		.returning();

	if (result.length === 0) throw new BadRequestException('Failed to create forcast');

	return okResponse(createOkApiResponse(createForcastResponseSchema, { id: result[0].id }), 201);
});

export const PUT = createApiRoute(async ({ cookies, request }) => {
	const user = await verifyAuth(cookies);
	const body = updateForcastPayloadSchema.safeParse(await request.json());

	if (!user) throw new UnauthorizedException();
	if (!body.success) {
		logger.error(`Invalid request body: ${JSON.stringify({ cause: body.error })}`);
		throw new BadRequestException('Invalid request body');
	}

	await db.transaction(async (tx) => {
		const rows = await tx
			.update(forcast)
			.set({
				name: body.data.name,
				targetDate: body.data.targetDate,
				updatedAt: generateCurrentTimestamp()
			})
			.where(and(eq(forcast.userId, user.id), eq(forcast.id, body.data.id)))
			.returning();

		if (rows.length === 0) {
			throw new NotFoundException(
				'Forcast not found or you do not have permission to update it'
			);
		} else if (rows.length > 1) {
			throw new BadRequestException('Multiple forcasts found with the same id');
		}
	});

	return noContentResponse();
});

export const DELETE = createApiRoute(async ({ cookies, url }) => {
	const user = await verifyAuth(cookies);
	const id = url.searchParams.get('id');

	if (!user) throw new UnauthorizedException();
	if (!id) throw new BadRequestException('Missing forcast id');

	const result = await db
		.delete(forcast)
		.where(and(eq(forcast.userId, user.id), eq(forcast.id, id)))
		.returning();

	if (result.length === 0) {
		throw new NotFoundException('Forcast not found or you do not have permission to delete it');
	}

	return noContentResponse();
});
