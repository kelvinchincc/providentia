import z from 'zod';

export const jwtSchema = z.object({
	u: z
		.string()
		.min(36, { message: 'User UID is required' })
		.max(36, { message: 'User UID must be valid UUID' }),
	s: z.string().min(1, { message: 'Token seed is required' }),
	t: z.enum(['a', 'r'], { message: 'Token type is required' })
});

export type JWTPayload = z.infer<typeof jwtSchema>;

export const JWTType: Record<'ACCESS' | 'REFRESH', JWTPayload['t']> = {
	ACCESS: 'a',
	REFRESH: 'r'
};
