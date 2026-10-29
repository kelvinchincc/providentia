import { defineEnvVars } from '@sveltejs/kit/env';

const required = (name: string) => (input: string | undefined) => {
	if (!input) throw new Error(`Missing required environment variable: ${name}`);
	return input;
};

const number = (name: string) => (input: string | undefined) => {
	const value = Number(required(name)(input));
	if (Number.isNaN(value) || value <= 0)
		throw new Error(`Invalid environment variable: ${name} must be a positive number`);
	return value;
};

export const variables = defineEnvVars({
	APP_URL: { schema: required('APP_URL') },
	JWT_SECRET: { schema: required('JWT_SECRET') },
	DATABASE_URL: { schema: required('DATABASE_URL') },
	GEM_UNIT: { schema: (value) => value || 'Gems', public: true },
	PULL_PRICE: { schema: number('PULL_PRICE'), public: true },
	WORST_CASE_PULLS: { schema: number('WORST_CASE_PULLS'), public: true },
	MAX_COPIES: { schema: number('MAX_COPIES'), public: true },
	BUFFER_FACTOR: { schema: number('BUFFER_FACTOR'), public: true },
	TOTAL_WEEKLY_GEMS_OBTAINABLE: {
		schema: (value) => Number.parseInt(value ?? '0') || 0
	}
});
