CREATE TABLE `notes` (
	`color` text DEFAULT 'red' NOT NULL,
	`html` text,
	`id` text PRIMARY KEY,
	`x` integer NOT NULL,
	`y` integer NOT NULL
);
