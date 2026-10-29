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

## WORST_CASE_PULLS

The number of pulls needed to obtain one copy of a target unit in the worst case, for example when no copy shows up
before the pity counter is reached. Multiplied by `MAX_COPIES` to get the total number of pulls needed to max out a
target (`TARGET_PULL_AMOUNT`). This must be a positive number, and it is required. For example:

```
WORST_CASE_PULLS=200
```

## MAX_COPIES

The number of copies of a target unit needed to max it out. Multiplied by `WORST_CASE_PULLS` to get the total number of
pulls needed for a target (`TARGET_PULL_AMOUNT`). This must be a positive number, and it is required. For example:

```
MAX_COPIES=6
```

## BUFFER_FACTOR

A safety multiplier applied to the cost of a target. The safe price is calculated as
`SAFE_PULL_PRICE = TARGET_PULL_PRICE * BUFFER_FACTOR`, where `TARGET_PULL_PRICE = PULL_PRICE * TARGET_PULL_AMOUNT`.
Forecasts are marked as `safe` when the expected gems reach the safe price, `hit` when they reach the target price, and
`no` otherwise. This must be a positive number, and it is required. Decimals are allowed. Keep it at `1` or above, since
a value below `1` makes `safe` trigger before `hit`, so `hit` never shows. For example:

```
BUFFER_FACTOR=2
```

## TOTAL_WEEKLY_GEMS_OBTAINABLE

The total amount of gems a user can get in a week, uses to calculate daily confrimed obtain rate, which is a constants
where the user can get from fixed dialy tasks, and login rewards.
