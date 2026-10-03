import { defineEnvVars } from '@sveltejs/kit/env';

const required = (name: string) => (input: string | undefined) => {
	if (!input) throw new Error(`Missing required environment variable: ${name}`);
	return input;
};

export const variables = defineEnvVars({
	APP_URL: { schema: required('APP_URL') },
	JWT_SECRET: { schema: required('JWT_SECRET') },
	DATABASE_URL: { schema: required('DATABASE_URL') }
});
