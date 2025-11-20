CREATE TABLE "email_otps" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"otp" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "emailVerified" boolean DEFAULT false NOT NULL;