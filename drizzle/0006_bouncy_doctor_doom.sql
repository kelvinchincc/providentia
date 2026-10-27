PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_note_presets` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_note_presets`("id", "user_id", "name", "content", "created_at", "updated_at") SELECT "id", "user_id", "name", "content", "created_at", "updated_at" FROM `note_presets`;--> statement-breakpoint
DROP TABLE `note_presets`;--> statement-breakpoint
ALTER TABLE `__new_note_presets` RENAME TO `note_presets`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_note_presets_userid_name` ON `note_presets` (`user_id`,`name`);