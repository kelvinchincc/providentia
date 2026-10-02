/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { db } from '$lib/server/db';

/**
 * Checks if the application needs initialization by querying the database for the first user.
 * @returns Returns true if no user is found (indicating that initialization is needed), otherwise false.
 */
export async function needInitializationCheck() {
	const result = await db.query.user.findFirst();
	return !result;
}
