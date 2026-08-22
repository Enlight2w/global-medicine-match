ALTER TABLE `inventoryFeedConnections` ADD `webhookSecretHash` varchar(128);--> statement-breakpoint
ALTER TABLE `inventoryFeedConnections` ADD `lastEventId` varchar(180);--> statement-breakpoint
ALTER TABLE `medicineListings` ADD `externalSourceId` varchar(180);