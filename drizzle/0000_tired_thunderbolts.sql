CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`jwt_seed` text NOT NULL,
	`refresh_token_seed` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `username_idx` ON `users` (`username`);--> statement-breakpoint
CREATE TABLE `gems` (
	`id` text PRIMARY KEY NOT NULL,
	`amount` integer DEFAULT 0 NOT NULL,
	`obtained_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`note` text,
	`type` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `stats` (
	`id` text PRIMARY KEY NOT NULL,
	`item` text NOT NULL,
	`value` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `item_idx` ON `stats` (`item`);