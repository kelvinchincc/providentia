/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { JWT_SECRET } from '$app/env/private';
import { FailedHashPasswordException } from '#lib/exception/failed-hash-password.js';
import { FailedVerifyPasswordException } from '#lib/exception/failed-verify-password.js';
import { InvalidJWTPayloadException } from '#lib/exception/invalid-jwt-payload.js';
import { logger } from './logger';
import argon2 from 'argon2';
import { jwtSchema, JWTType, type JWTPayload } from '#lib/schema/base/jwt.js';
import { ZodError } from 'zod';
import * as jose from 'jose';
import type { Cookies } from '@sveltejs/kit';
import { UnauthorizedException } from '#lib/exception/http/index.js';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { user as userRepo } from '../db/schemas';
import { AUTH_COOKIE_TTL, COOKIE_OPTIONS, REFRESH_COOKIE_TTL } from '#lib/constants/cookies.js';

export function getJWTSecret() {
	const jwtSecret = JWT_SECRET;

	if (!jwtSecret) {
		logger.error('JWT_SECRET environment variable is not set');
		throw new Error('JWT_SECRET environment variable is not set');
	}

	return jwtSecret;
}

export async function hashPassword(password: string) {
	try {
		const hash = await argon2.hash(password);
		return hash;
	} catch (error) {
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

/**
 * Signs a JWT payload using the secret key.
 * @param payload - The payload to be signed in the JWT.
 * @throws {InvalidJWTPayloadException} If the payload is invalid according to the JWT schema.
 */
export async function signJWTSecret(payload: JWTPayload) {
	try {
		jwtSchema.parse(payload);
	} catch (error) {
		if (!(error instanceof ZodError)) throw error;

		throw new InvalidJWTPayloadException('Invalid JWT payload');
	}

	const signed = await new jose.SignJWT(payload)
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime(payload.t === JWTType.ACCESS ? AUTH_COOKIE_TTL : REFRESH_COOKIE_TTL)
		.sign(new TextEncoder().encode(getJWTSecret()));
	return signed;
}

/**
 * Verifies a JWT token against the provided seed and type.
 * @param token - The JWT token to be verified.
 * @param type - The expected type of the JWT payload.
 * @returns A promise that resolves to the user object if the token is valid, or null if invalid.
 */
export async function verifyJWTSecret(token: string, type: JWTPayload['t']) {
	const secret = new TextEncoder().encode(getJWTSecret());
	try {
		const { payload } = await jose.jwtVerify(token, secret, {
			algorithms: ['HS256']
		});

		jwtSchema.parse(payload);
		const userId = (payload as JWTPayload).u;
		const user = await db.query.user.findFirst({ where: eq(userRepo.id, userId) });

		if (!user) {
			return null;
		}

		const seed = user.jwtSeed;

		if (payload.s !== seed || payload.t !== type) {
			return null;
		}

		return user;
	} catch (error) {
		logger.error('Error verifying JWT:', error);
		return null;
	}
}

/**
 * Verifies the authentication of a user based on the JWT token stored in cookies.
 *
 * @param cookies - The cookies object containing the JWT token.
 * @param jwtType - The expected type of the JWT payload (default is JWTType.ACCESS).
 * @returns The user object if the token is valid, or throws an UnauthorizedException if invalid.
 * @throws {UnauthorizedException} If the token is missing, empty, or invalid.
 */
export async function verifyAuth(cookies: Cookies, jwtType: JWTPayload['t'] = JWTType.ACCESS) {
	const cookie =
		jwtType === JWTType.ACCESS ? COOKIE_OPTIONS.AUTH_COOKIE : COOKIE_OPTIONS.REFRESH_COOKIE;
	const token = cookies.get(cookie);
	if (token == null || token === '') {
		throw new UnauthorizedException();
	}

	const jwtPayload = await verifyJWTSecret(token, jwtType);

	if (jwtPayload == null) throw new UnauthorizedException();

	return jwtPayload;
}
