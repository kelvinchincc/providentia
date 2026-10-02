import { db } from '$lib/server/db';
import { user as userRepo } from '$lib/server/db/schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from '../../healthcheck/$types';
import { registerUserRequestSchema, type RegisterUserRequest } from '$lib/schema/api/register-user';

export const POST: RequestHandler = async ({ request }) => {
	const body: RegisterUserRequest = await request.json();

	try {
		registerUserRequestSchema.parse(body);
	} catch (error) {
		return new Response('Bad Request', { status: 400 });
	}

	if (body.password !== body.confirmPassword) {
		return new Response('Bad Request', { status: 400 });
	}

	const existingUser = await db.query.user.findFirst({
		where: eq(userRepo.username, body.username)
	});

	if (existingUser) {
		return new Response('Conflict', { status: 409 });
	}

	await db.transaction(async (tr) => {
		await tr.insert(userRepo).values({
			username: body.username,
			jwtSeed: crypto.randomUUID(),
			passwordHash: crypto.randomUUID(), // Placeholder for password hashing, replace with actual hashing logic
			refreshTokenSeed: crypto.randomUUID()
		});
	});

	return new Response('Created', { status: 201 });
};
