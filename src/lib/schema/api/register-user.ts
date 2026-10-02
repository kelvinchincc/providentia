import { z } from 'zod';

export const registerUserRequestSchema = z.object({
	username: z.string().min(3).max(30),
	password: z.string().min(8).max(100),
	confirmPassword: z.string().min(8).max(100)
});

export type RegisterUserRequest = z.infer<typeof registerUserRequestSchema>;
