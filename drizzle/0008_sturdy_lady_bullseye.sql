ALTER TABLE `forcasts` RENAME TO `forecasts`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_forecasts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`target_date` integer NOT NULL,
	`name` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_forecasts`("id", "user_id", "created_at", "updated_at", "target_date", "name") SELECT "id", "user_id", "created_at", "updated_at", "target_date", "name" FROM `forecasts`;--> statement-breakpoint
DROP TABLE `forecasts`;--> statement-breakpoint
ALTER TABLE `__new_forecasts` RENAME TO `forecasts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `forecasts_target_date_updated_at_idx` ON `forecasts` (`target_date`,`"updated_at" desc`);