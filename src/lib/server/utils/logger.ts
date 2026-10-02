import winston from 'winston';

const isProduction = process.env.NODE_ENV === 'production';

export const logger = winston.createLogger({
	level: isProduction ? 'info' : 'debug',
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.colorize({ level: true })
	),
	transports: [
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.printf(({ timestamp, level, message }) => {
					return `${timestamp} [${level}]: ${message}`;
				})
			)
		})
	]
});
