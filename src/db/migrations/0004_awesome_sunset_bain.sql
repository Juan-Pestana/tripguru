CREATE TABLE "connection_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"location_id" text NOT NULL,
	"connection_type" text NOT NULL,
	"power_kw" numeric,
	"quantity" numeric,
	"current_type" text
);
--> statement-breakpoint
CREATE TABLE "ev_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"location_id" text NOT NULL,
	"operator" text,
	"usage_cost" text,
	"address" text,
	"city" text,
	"access_type" text,
	"is_operational" boolean DEFAULT true,
	"total_points" numeric,
	"phone_number" text,
	"last_verified" timestamp
);
--> statement-breakpoint
ALTER TABLE "connection_types" ADD CONSTRAINT "connection_types_location_id_locations_external_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("external_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ev_details" ADD CONSTRAINT "ev_details_location_id_locations_external_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("external_id") ON DELETE no action ON UPDATE no action;