CREATE TABLE `complianceProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`countryCode` varchar(2) NOT NULL,
	`countryName` varchar(120) NOT NULL,
	`marketStatus` enum('pilot_ready','review_required','research_queue') NOT NULL,
	`requirements` json NOT NULL,
	`restrictions` json NOT NULL,
	`reviewerNote` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `complianceProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `complianceProfiles_countryCode_unique` UNIQUE(`countryCode`)
);
--> statement-breakpoint
CREATE TABLE `medicineListings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`medicineName` varchar(200) NOT NULL,
	`dosage` varchar(100) NOT NULL,
	`quantity` int NOT NULL,
	`quantityUnit` varchar(40) NOT NULL DEFAULT 'packs',
	`expiryDate` date NOT NULL,
	`traceabilityId` varchar(160) NOT NULL,
	`storageHistory` text NOT NULL,
	`sealed` boolean NOT NULL,
	`controlled` boolean NOT NULL,
	`recalled` boolean NOT NULL,
	`nonRefrigerated` boolean NOT NULL,
	`countryCode` varchar(2) NOT NULL,
	`reviewStatus` enum('pending','approved','hold','rejected') NOT NULL DEFAULT 'pending',
	`reviewNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `medicineListings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medicineMatches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listingId` int NOT NULL,
	`requestId` int NOT NULL,
	`complianceStatus` enum('not_checked','ready_for_review','blocked') NOT NULL DEFAULT 'not_checked',
	`matchStatus` enum('suggested','approved','hold','rejected','completed') NOT NULL DEFAULT 'suggested',
	`reviewNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `medicineMatches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerUserId` int,
	`name` varchar(200) NOT NULL,
	`role` enum('pharmacy','hospital','manufacturer','clinic','ngo') NOT NULL,
	`licenseNumber` varchar(120) NOT NULL,
	`countryCode` varchar(2) NOT NULL,
	`serviceArea` varchar(180) NOT NULL,
	`contactEmail` varchar(320) NOT NULL,
	`reviewStatus` enum('pending','approved','hold','rejected') NOT NULL DEFAULT 'pending',
	`reviewNotes` text,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organizations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recipientRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`medicineName` varchar(200) NOT NULL,
	`dosage` varchar(100) NOT NULL,
	`quantityNeeded` int NOT NULL,
	`urgency` enum('routine','priority','urgent') NOT NULL DEFAULT 'routine',
	`countryCode` varchar(2) NOT NULL,
	`patientPopulation` text NOT NULL,
	`reviewStatus` enum('pending','approved','hold','rejected') NOT NULL DEFAULT 'pending',
	`reviewNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recipientRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `statusUpdates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entityType` enum('organization','listing','request','match') NOT NULL,
	`entityId` int NOT NULL,
	`previousStatus` varchar(40),
	`nextStatus` varchar(40) NOT NULL,
	`message` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `statusUpdates_id` PRIMARY KEY(`id`)
);
