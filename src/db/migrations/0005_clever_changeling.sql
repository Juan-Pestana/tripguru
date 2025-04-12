ALTER TABLE "es_info" RENAME COLUMN "eess_id" TO "location_id";--> statement-breakpoint
ALTER TABLE "es_info" DROP CONSTRAINT "esinfo_eess_id_unique";--> statement-breakpoint
ALTER TABLE "es_info" DROP CONSTRAINT "es_info_eess_id_locations_external_id_fk";
--> statement-breakpoint
DROP INDEX "idx_esinfo_ideess";--> statement-breakpoint
ALTER TABLE "es_info" ADD CONSTRAINT "es_info_location_id_locations_external_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("external_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_esinfo_ideess" ON "es_info" USING btree ("location_id");--> statement-breakpoint
ALTER TABLE "es_info" ADD CONSTRAINT "esinfo_eess_id_unique" UNIQUE("location_id");