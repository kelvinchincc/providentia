/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { BadRequestException } from '#lib/exception/http/bad-request-exception.js';
import { createOkApiResponse } from '#lib/schema/api/base.js';
import { createNotePresetRequest } from '#lib/schema/api/create-note-preset.js';
import { notePresetsSchema, type NotePreset } from '#lib/schema/api/get-note-presets.js';
import { updateNotePresetPayloadSchema } from '#lib/schema/api/update-note-preset.js';
import { db } from '#lib/server/db/index.js';
import { notePreset } from '#lib/server/db/schemas/note-preset.schema.js';
import { createApiRoute, noContentResponse, okResponse } from '#lib/server/utils/api.js';
import { verifyAuth } from '#lib/server/utils/auth.js';
import dayjs from 'dayjs';
import { eq, and } from 'drizzle-orm';

/**
 * Lists the authenticated user's note presets.
 *
 * Each preset's `content` is returned as `tag`.
 *
 * @param event - The request event provided by `createApiRoute`.
 * @param event.cookies - Cookies used to verify the access token.
 * @returns A 200 response with the user's note presets.
 * @throws {UnauthorizedException} 401 if the user is not authenticated.
 */
export const GET = createApiRoute(async ({ cookies }) => {
	const user = await verifyAuth(cookies);

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

/**
 * Creates a note preset for the authenticated user.
 *
 * @param event - The request event provided by `createApiRoute`.
 * @param event.cookies - Cookies used to verify the access token.
 * @param event.request - Incoming request whose JSON body holds `content` and an optional
 * `name`, which defaults to an empty string.
 * @returns A 204 No Content response on success.
 * @throws {UnauthorizedException} 401 if the user is not authenticated.
 * @throws {BadRequestException} 400 if the body fails schema validation.
 */
export const POST = createApiRoute(async ({ cookies, request }) => {
	const authUser = await verifyAuth(cookies);
	const body = createNotePresetRequest.safeParse(await request.json());
	if (!body.success) throw new BadRequestException(body.error.message);

	const payload = body.data;
	await db.insert(notePreset).values({
		userId: authUser.id,
		content: payload.content,
		name: payload.name ?? ''
	});

	return noContentResponse();
});

/**
 * Updates the content of one of the authenticated user's note presets.
 *
 * Returns 204 even when no preset owned by the user matches `id`, since the update does not
 * check for a matching row.
 *
 * @param event - The request event provided by `createApiRoute`.
 * @param event.cookies - Cookies used to verify the access token.
 * @param event.request - Incoming request whose JSON body holds `id` and `content`.
 * @returns A 204 No Content response on success.
 * @throws {UnauthorizedException} 401 if the user is not authenticated.
 * @throws {BadRequestException} 400 if the body fails schema validation.
 */
export const PUT = createApiRoute(async ({ cookies, request }) => {
	const user = await verifyAuth(cookies);
	const body = updateNotePresetPayloadSchema.safeParse(await request.json());

	if (!body.success) throw new BadRequestException(body.error.message);

	await db
		.update(notePreset)
		.set({
			content: body.data.content,
			updatedAt: dayjs().unix()
		})
		.where(and(eq(notePreset.userId, user.id), eq(notePreset.id, body.data.id)));

	return noContentResponse();
});

/**
 * Deletes one of the authenticated user's note presets.
 *
 * Returns 204 even when no preset owned by the user matches `id`.
 *
 * @param event - The request event provided by `createApiRoute`.
 * @param event.cookies - Cookies used to verify the access token.
 * @param event.url - Request URL whose `id` query parameter names the preset to delete.
 * @returns A 204 No Content response on success.
 * @throws {UnauthorizedException} 401 if the user is not authenticated.
 * @throws {BadRequestException} 400 if the `id` query parameter is missing.
 */
export const DELETE = createApiRoute(async ({ cookies, url }) => {
	const authUser = await verifyAuth(cookies);
	const id = url.searchParams.get('id');

	if (id == null) throw new BadRequestException('Missing id parameter');

	await db
		.delete(notePreset)
		.where(and(eq(notePreset.userId, authUser.id), eq(notePreset.id, id)));

	return noContentResponse();
});
