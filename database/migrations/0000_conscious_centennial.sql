CREATE TABLE `exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`trainee_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`trainee_id`) REFERENCES `trainees`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `muscle_exercise_mappings` (
	`muscle_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	PRIMARY KEY(`exercise_id`, `muscle_id`),
	FOREIGN KEY (`muscle_id`) REFERENCES `muscles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `muscles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`trainee_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`trainee_id`) REFERENCES `trainees`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `trainees` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`image` text NOT NULL,
	`auth_user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `training_records` (
	`id` text PRIMARY KEY NOT NULL,
	`memo` text NOT NULL,
	`order` integer NOT NULL,
	`training_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	FOREIGN KEY (`training_id`) REFERENCES `trainings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `training_sets` (
	`id` text PRIMARY KEY NOT NULL,
	`weight` real NOT NULL,
	`repetition` integer NOT NULL,
	`rpe` integer NOT NULL,
	`order` integer NOT NULL,
	`estimated_maximum_weight` real NOT NULL,
	`record_id` text NOT NULL,
	FOREIGN KEY (`record_id`) REFERENCES `training_records`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `trainings` (
	`id` text PRIMARY KEY NOT NULL,
	`date` integer NOT NULL,
	`trainee_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`trainee_id`) REFERENCES `trainees`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `exercises_trainee_index` ON `exercises` (`trainee_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `exercises_trainee_id_name_unique` ON `exercises` (`trainee_id`,`name`);--> statement-breakpoint
CREATE INDEX `muscles_trainee_index` ON `muscles` (`trainee_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `muscles_trainee_id_name_unique` ON `muscles` (`trainee_id`,`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `trainees_auth_user_id_unique` ON `trainees` (`auth_user_id`);--> statement-breakpoint
CREATE INDEX `training_index` ON `training_records` (`training_id`);--> statement-breakpoint
CREATE INDEX `exercise_index` ON `training_records` (`exercise_id`);--> statement-breakpoint
CREATE INDEX `record_index` ON `training_sets` (`record_id`);--> statement-breakpoint
CREATE INDEX `estimated_maximum_weight_index` ON `training_sets` (`estimated_maximum_weight`);--> statement-breakpoint
CREATE INDEX `trainings_trainee_index` ON `trainings` (`trainee_id`);