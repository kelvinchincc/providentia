/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { JWT_SECRET } from '$app/env/private';
import { FailedHashPasswordException } from '#lib/exception/failed-hash-password.js';
import { FailedVerifyPasswordException } from '#lib/exception/failed-verify-password.js';
import { logger } from './logger';
import argon2 from 'argon2';

export function getJWTSecret() {
	const jwtSecret = JWT_SECRET;

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

export async function verifyPassword(hash: string, password: string) {
	try {
		const isValid = await argon2.verify(hash, password);
		return isValid;
	} catch (error) {
		logger.error('Error verifying password:', error);
		throw new FailedVerifyPasswordException('Failed to verify password');
	}
}

/**
 * Generates a random seed for cryptographic purposes.
 * @returns {string} A random seed represented as a string in hex format.
 */
export function generateSeed(): string {
	const length = 256; // Length of the seed in bits
	const array = new Uint8Array(length / 8);
	crypto.getRandomValues(array);
	return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}
