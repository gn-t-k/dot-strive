CREATE TABLE `trainees` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`image` text NOT NULL,
	`authUserId` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `trainees_authUserId_unique` ON `trainees` (`authUserId`);