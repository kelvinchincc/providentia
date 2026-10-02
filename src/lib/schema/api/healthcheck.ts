import { z } from 'zod';
import { createBaseApiResponseSchema } from './base';

export const healthcheckApiDataSchema = z.object({
	status: z.string(),
	initialized: z.boolean()
});
export const healthcheckApiResponseSchema = createBaseApiResponseSchema(healthcheckApiDataSchema);

export type HealthCheckApiData = z.infer<typeof healthcheckApiDataSchema>;
export type HealthcheckApiResponse = z.infer<typeof healthcheckApiResponseSchema>;
