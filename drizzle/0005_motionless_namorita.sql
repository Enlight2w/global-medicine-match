CREATE TABLE `inventoryFeedActivationAudit` (
	`id` int AUTO_INCREMENT NOT NULL,
	`feedId` int NOT NULL,
	`actorUserId` int NOT NULL,
	`previousStatus` enum('awaiting_credentials','ready','paused','error') NOT NULL,
	`nextStatus` enum('awaiting_credentials','ready','paused','error') NOT NULL,
	`reason` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inventoryFeedActivationAudit_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventoryFeedEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`feedId` int NOT NULL,
	`eventId` varchar(180) NOT NULL,
	`status` enum('processing','processed') NOT NULL DEFAULT 'processing',
	`receivedAt` timestamp NOT NULL DEFAULT (now()),
	`processedAt` timestamp,
	CONSTRAINT `inventoryFeedEvents_id` PRIMARY KEY(`id`),
	CONSTRAINT `inventoryFeedEvents_feedId_eventId_unique` UNIQUE(`feedId`,`eventId`)
);
