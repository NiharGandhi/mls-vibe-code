-- Drop messaging/conversation tables and enum (feature removed)
DROP TABLE IF EXISTS "messages";--> statement-breakpoint
DROP TABLE IF EXISTS "conversation_participants";--> statement-breakpoint
DROP TABLE IF EXISTS "conversations";--> statement-breakpoint
DROP TYPE IF EXISTS "conversation_type";
