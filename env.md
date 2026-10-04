# Environment variables for the application

Environment variables are used to configure the application without hardcoding values into the source code. This allows
for easier configuration and deployment across different environments (development, testing, production). Example
environment file can be found in `.env.example`. You can copy this file to `.env` and modify the values as needed.

## DATABASE_URL

The URL for the database connection. This should be in the format:

```
file:/path/to/database.db
```

Eg:

```
DATABASE_URL=file:database.db
```

## APP_URL

The URL for the application, uses for server side rendering and generating links. This should be in the format:

```
http://localhost:5173
```

eg:

```
APP_URL=http://localhost:5173
```

## JWT_SECRET

The secret key used for signing JSON Web Tokens (JWT). This should be a long, random string to ensure security. Should
be generated via the provided `pnpm generate:jwt-secret` script, OpenSSL or similar. For example:

```
JWT_SECRET=your_random_secret_key_here
```

To generate one via the provided script, you can run the following command:

```
pnpm generate:jwt-secret
```
