/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { BadRequestException } from '#lib/exception/http/bad-request-exception.js';
import { UnauthorizedException } from '#lib/exception/http/unauthorized-exception.js';
import { createOkApiResponse } from '#lib/schema/api/base.js';
import { createNotePresetRequest } from '#lib/schema/api/create-note-preset.js';
import { notePresetsSchema, type NotePreset } from '#lib/schema/api/get-note-presets.js';
import { db } from '#lib/server/db/index.js';
import { notePreset } from '#lib/server/db/schemas/note-preset.schema.js';
import { createApiRoute, noContentResponse, okResponse } from '#lib/server/utils/api.js';
import { verifyAuth } from '#lib/server/utils/auth.js';
import { eq, and } from 'drizzle-orm';

export const GET = createApiRoute(async ({ cookies }) => {
	const user = await verifyAuth(cookies);
	if (user == null) throw new UnauthorizedException();

	const results = await db.select().from(notePreset).where(eq(notePreset.userId, user.id));
	return okResponse(
		createOkApiResponse(
			notePresetsSchema,
			results.map((data): NotePreset => {
				return {
					id: data.id,
					tag: data.content,
					createdAt: data.createdAt,
					updatedAt: data.updatedAt
				};
			})
		)
	);
});

export const POST = createApiRoute(async ({ cookies, request }) => {
	const authUser = await verifyAuth(cookies);
	const body = createNotePresetRequest.safeParse(await request.json());
	if (authUser == null) throw new UnauthorizedException();
	if (!body.success) throw new BadRequestException(body.error.message);

	const payload = body.data;
	await db.insert(notePreset).values({
		userId: authUser.id,
		content: payload.content,
		name: payload.name ?? ''
	});

	return noContentResponse();
});

export const DELETE = createApiRoute(async ({ cookies, url }) => {
	const authUser = await verifyAuth(cookies);
	const id = url.searchParams.get('id');

	if (authUser == null) throw new UnauthorizedException();
	if (id == null) throw new BadRequestException('Missing id parameter');

	await db
		.delete(notePreset)
		.where(and(eq(notePreset.userId, authUser.id), eq(notePreset.id, id)));

	return noContentResponse();
});
