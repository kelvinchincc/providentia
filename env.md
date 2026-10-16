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

## GEM_UNIT

The unit of measurement for gems in the application. This can be set to any string value that represents the unit you
want to use. For example:

```
GEM_UNIT=Magia Stones
```

Default value is `Gems`. You can change it to any other unit of your choice, or following the game you want to manage.

## PULL_PRICE

The cost of one pull, in `GEM_UNIT`. Used to calculate how many pulls a user can afford with the gems they have. This
must be a positive number, and it is required. The app fails to start if the value is missing, not a number, or not
greater than `0`. For example:

```
PULL_PRICE=160
```

## DB_MODE

The mode in which the sqlite database operates. This can be set to either `delete` or `wal`, this field is required.
Delete mode is the sqlite default mode, if not sure what WAL mode dose, set it to `delete`, it is the safest option. WAL
mode is faster and more efficient, but it requires more disk space and can be more complex to manage. To learn more
about WAL mode, you can read the sqlite documentation on [WAL mode](https://www.sqlite.org/wal.html).

Exaple:

```
DB_MODE=delete
```
