CREATE TABLE "locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text DEFAULT 'unknown' NOT NULL,
	"type" text DEFAULT 'service_station' NOT NULL,
	"location" geometry(point) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "spatial_index" ON "locations" USING gist ("location");