CREATE TABLE "user_permissions" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"permissionId" text NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permissionId_permissions_id_fk" FOREIGN KEY ("permissionId") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;