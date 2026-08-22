CREATE TABLE `complianceAssessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int,
	`listingId` int,
	`countryCode` varchar(2) NOT NULL,
	`recommendation` enum('human_review','hold','block') NOT NULL,
	`rationale` text NOT NULL,
	`requiredChecks` json NOT NULL,
	`flags` json NOT NULL,
	`reviewerRequired` boolean NOT NULL DEFAULT true,
	`source` enum('deterministic','ai_assisted') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `complianceAssessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventoryFeedConnections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`providerName` varchar(160) NOT NULL,
	`connectionMode` enum('webhook','scheduled_pull') NOT NULL,
	`endpoint` varchar(1000) NOT NULL,
	`credentialReference` varchar(160),
	`syncStatus` enum('awaiting_credentials','ready','paused','error') NOT NULL DEFAULT 'awaiting_credentials',
	`lastSyncedAt` timestamp,
	`scheduleCronTaskUid` varchar(65),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventoryFeedConnections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organizationApprovalAudit` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`reviewerUserId` int NOT NULL,
	`decision` enum('approved','hold','rejected') NOT NULL,
	`assignedRole` enum('user','partner','admin') NOT NULL,
	`notes` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `organizationApprovalAudit_id` PRIMARY KEY(`id`)
);
