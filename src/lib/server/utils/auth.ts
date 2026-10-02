/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { env } from '$env/dynamic/private';
import { FailedHashPasswordException } from '$lib/exception/failed-hash-password';
import { FailedVerifyPasswordException } from '$lib/exception/failed-verify-password';
import { logger } from './logger';
import argon2 from 'argon2';

export function getJWTSecret() {
	const jwtSecret = env.JWT_SECRET;

	if (!jwtSecret) {
		logger.error('JWT_SECRET environment variable is not set');
		throw new Error('JWT_SECRET environment variable is not set');
	}

	return jwtSecret;
}

export function hashPassword(password: string) {
	try {
		const hash = argon2.hash(password);
		return hash;
	} catch (error) {
		logger.error('Error hashing password:', error);
		throw new FailedHashPasswordException('Failed to hash password');
	}
}

export function veirfyPassword(hash: string, password: string) {
	try {
		const isValid = argon2.verify(hash, password);
		return isValid;
	} catch (error) {
		logger.error('Error verifying password:', error);
		throw new FailedVerifyPasswordException('Failed to verify password');
	}
}
