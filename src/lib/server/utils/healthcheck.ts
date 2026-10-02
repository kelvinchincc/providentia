import { db } from '$lib/server/db';

/**
 * Checks if the application needs initialization by querying the database for the first user.
 * @returns Returns true if no user is found (indicating that initialization is needed), otherwise false.
 */
export async function needInitializationCheck() {
	const result = await db.query.user.findFirst();
	return !result;
}
